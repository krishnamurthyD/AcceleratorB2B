import { LightningElement, api, wire, track } from 'lwc';
import { ProductAdapter, ProductPricingAdapter } from 'commerce/productApi';
import { addItemToCart } from 'commerce/cartApi';
import { CartAdapter } from 'commerce/checkoutCartApi';
import { NavigationMixin } from 'lightning/navigation';
import { addItemToWishlist, deleteItemFromWishlist, WishlistsAdapter } from 'commerce/wishlistApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { createCheckoutBeginDataEvent, dispatchDataEvent } from 'commerce/dataEventApi';

export default class ProductQuickView extends NavigationMixin(LightningElement) {
    @api productId;
    @api isOpen = false;
    
    @track quantity = 1;
    @track isWishlisted = false;
    @track wishlistItemId;
    @track wishlistId;

    @track productData;
    @track pricingData;
    @track cartId;
    @track currentImageIndex = 0;

    connectedCallback() {
        console.log('ProductQuickView: Component initialized. ProductId:', this.productId);
    }

    @wire(ProductAdapter, { productId: '$productId' })
    wiredProduct({ data, error }) {
        if (data) {
            console.log('ProductQuickView: Product Data Loaded:', JSON.stringify(data));
            this.productData = data;
        } else if (error) {
            console.error('ProductQuickView: Product Data Error:', error);
        }
    }

    @wire(ProductPricingAdapter, { productId: '$productId' })
    wiredPricing({ data, error }) {
        if (data) {
            console.log('ProductQuickView: Pricing Data Loaded:', JSON.stringify(data));
            this.pricingData = data;
        } else if (error) {
            console.error('ProductQuickView: Pricing Data Error:', error);
        }
    }

    @wire(CartAdapter)
    wiredCart({ data, error }) {
        if (data) {
            console.log('ProductQuickView: Cart Data Loaded:', JSON.stringify(data));
            this.cartId = data.cartId || data.summary?.cartId;
        } else if (error) {
            console.error('ProductQuickView: Cart Data Error:', error);
        }
    }

    @wire(WishlistsAdapter, {
        includeDisplayedList: true,
        pageSize: 500
    })
    wiredWishlists({ data, error }) {
        if (data) {
            console.log('ProductQuickView: Wishlists Loaded:', data);
            if (data.displayedList) {
                this.wishlistId = data.displayedList.summary.id;
                if (data.displayedList.page && data.displayedList.page.items) {
                    const foundItem = data.displayedList.page.items.find(
                        item => item.productSummary.productId === this.productId
                    );
                    if (foundItem) {
                        console.log('ProductQuickView: Product is in wishlist. ItemId:', foundItem.wishlistItemId);
                        this.isWishlisted = true;
                        this.wishlistItemId = foundItem.wishlistItemId;
                    } else {
                        console.log('ProductQuickView: Product is NOT in wishlist.');
                        this.isWishlisted = false;
                        this.wishlistItemId = null;
                    }
                }
            } else if (data.summaries && data.summaries.length > 0) {
                // Fallback to first available wishlist if displayedList is missing
                this.wishlistId = data.summaries[0].id;
                console.log('ProductQuickView: Using first available wishlist:', this.wishlistId);
            }
        } else if (error) {
            console.error('ProductQuickView: Wishlist Error:', error);
        }
    }

    get productName() { return this.productData?.name; }
    
    get sku() { 
        return this.productData?.sku || 
               this.productData?.fields?.StockKeepingUnit?.value || 
               this.productData?.fields?.StockKeepingUnit; 
    }
    
    get description() {
        return this.productData?.fields?.Description?.value || 
               this.productData?.fields?.Description || 
               this.productData?.description;
    }

    get variationAttributes() {
        const variationInfo = this.productData?.variationInfo;
        const variationAttributeSet = this.productData?.variationAttributeSet;

        if (!variationInfo || !variationInfo.variationAttributeInfo) {
            return [];
        }

        // Convert object to array and sort by sequence
        const attributes = Object.values(variationInfo.variationAttributeInfo);
        attributes.sort((a, b) => a.sequence - b.sequence);

        return attributes.map(attr => {
            // Get the currently selected value for this attribute
            const selectedValue = variationAttributeSet?.attributes?.[attr.apiName];
            
            return {
                ...attr,
                options: attr.options.map(opt => ({
                    label: opt.label,
                    value: opt.apiName, // JSON uses apiName as the value key in options
                    class: opt.apiName === selectedValue ? 'option selected' : 'option'
                }))
            };
        });
    }

    get hasVariations() {
        return this.variationAttributes.length > 0;
    }

    handleVariationSelection(event) {
        const attributeName = event.target.dataset.apiName;
        const attributeValue = event.target.dataset.value;
        
        if (!attributeName || !attributeValue || !this.productData) return;

        console.log(`ProductQuickView: Variation selected - ${attributeName}: ${attributeValue}`);

        // 1. Get current selections
        const currentSelections = { ...(this.productData.variationAttributeSet?.attributes || {}) };
        
        // 2. Update with new selection
        currentSelections[attributeName] = attributeValue;

        // 3. Find matching product ID from mappings
        const mappings = this.productData.variationInfo?.attributesToProductMappings || [];
        
        const match = mappings.find(mapping => {
            // Check if this mapping matches ALL current selections
            return mapping.selectedAttributes.every(attr => {
                return currentSelections[attr.apiName] === attr.value;
            });
        });

        if (match) {
            console.log('ProductQuickView: Switching to variation:', match.productId);
            this.productId = match.productId; // This triggers the wire adapter to reload data
        } else {
            console.warn('ProductQuickView: No matching variation found for selection');
        }
    }

    get price() { 
        const priceValue = this.pricingData?.unitPrice || this.productData?.prices?.unitPrice;
        const currency = this.pricingData?.currencyIsoCode || this.productData?.prices?.currencyIsoCode || 'USD';
        return priceValue ? 
            new Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).format(priceValue) 
            : ''; 
    }
    
    get listPrice() { 
        const priceValue = this.pricingData?.listPrice || this.productData?.prices?.listPrice;
        const currency = this.pricingData?.currencyIsoCode || this.productData?.prices?.currencyIsoCode || 'USD';
        return priceValue ? 
            new Intl.NumberFormat('en-US', { style: 'currency', currency: currency }).format(priceValue) 
            : ''; 
    }

    get images() {
        if (!this.productData) return [];
        
        let allImages = [];
        
        // Try to get images from mediaGroups (specifically productDetailImage)
        if (this.productData.mediaGroups) {
            const detailGroup = this.productData.mediaGroups.find(group => group.developerName === 'productDetailImage');
            if (detailGroup && detailGroup.mediaItems) {
                allImages = detailGroup.mediaItems.map((item, index) => ({
                    url: item.url,
                    alt: item.alternateText || this.productName,
                    id: item.id || index
                }));
            }
        }

        // If no detail images, try default image
        if (allImages.length === 0 && this.productData.defaultImage) {
            allImages.push({
                url: this.productData.defaultImage.url,
                alt: this.productData.defaultImage.alternateText || this.productName,
                id: this.productData.defaultImage.id || 'default'
            });
        }

        return allImages.map((img, index) => ({
            ...img,
            dotClass: index === this.currentImageIndex ? 'dot active' : 'dot'
        }));
    }

    get currentImageUrl() {
        return this.images[this.currentImageIndex]?.url;
    }

    get showArrows() {
        return this.images.length > 1;
    }

    get prevButtonClass() {
        return this.currentImageIndex === 0 ? 'carousel-nav prev disabled' : 'carousel-nav prev';
    }

    get nextButtonClass() {
        return this.currentImageIndex === this.images.length - 1 ? 'carousel-nav next disabled' : 'carousel-nav next';
    }

    handleNextImage() {
        if (this.currentImageIndex < this.images.length - 1) {
            this.currentImageIndex++;
        }
    }

    handlePrevImage() {
        if (this.currentImageIndex > 0) {
            this.currentImageIndex--;
        }
    }

    get wishlistIconClass() {
        return this.isWishlisted ? 'wishlist-icon active' : 'wishlist-icon';
    }

    handleClose() {
        console.log('ProductQuickView: Closing modal');
        this.dispatchEvent(new CustomEvent('close'));
    }

    handleQuantityChange(event) {
        const action = event.target.dataset.action;
        console.log('ProductQuickView: Quantity change action:', action);
        if (action === 'increase') {
            this.quantity++;
        } else if (action === 'decrease' && this.quantity > 1) {
            this.quantity--;
        }
        console.log('ProductQuickView: New quantity:', this.quantity);
    }

    handleAddToCart() {
        console.log('ProductQuickView: Adding to cart. ProductId:', this.productId, 'Quantity:', this.quantity);
        addItemToCart(this.productId, this.quantity)
            .then((result) => {
                console.log('ProductQuickView: Added to cart successfully:', result);
                this.dispatchEvent(new ShowToastEvent({
                    title: 'Success',
                    message: 'Product added to cart',
                    variant: 'success'
                }));
                this.handleClose();
            })
            .catch((error) => {
                console.error('ProductQuickView: Error adding to cart:', error);
                this.dispatchEvent(new ShowToastEvent({
                    title: 'Error',
                    message: error.body?.message || error.message,
                    variant: 'error'
                }));
            });
    }

    handleQuickBuy() {
        console.log('ProductQuickView: Quick Buy initiated. ProductId:', this.productId, 'Quantity:', this.quantity);
        addItemToCart(this.productId, this.quantity)
            .then((result) => {
                console.log('ProductQuickView: Added to cart for Quick Buy. Result:', result);
                
                if (this.cartId) {
                    console.log('ProductQuickView: Dispatching checkout begin event. CartId:', this.cartId);
                    dispatchDataEvent(this, createCheckoutBeginDataEvent(this.cartId));
                } else {
                    console.warn('ProductQuickView: CartId not available, skipping checkout begin event.');
                }

                console.log('ProductQuickView: Navigating to checkout.');
                // Navigate to Checkout
                this[NavigationMixin.Navigate]({
                    type: 'comm__namedPage',
                    attributes: {
                        name: 'Current_Checkout'
                    }
                });
            })
            .catch((error) => {
                console.error('ProductQuickView: Error in Quick Buy:', error);
                this.dispatchEvent(new ShowToastEvent({
                    title: 'Error',
                    message: error.body?.message || error.message,
                    variant: 'error'
                }));
            });
    }

    handleWishlistToggle() {
        console.log('ProductQuickView: Toggling wishlist. Current status:', this.isWishlisted);
        
        if (!this.wishlistId) {
            console.error('ProductQuickView: No wishlist ID available.');
            this.dispatchEvent(new ShowToastEvent({
                title: 'Error',
                message: 'Unable to access wishlist. Please try again later.',
                variant: 'error'
            }));
            return;
        }

        if (this.isWishlisted) {
            console.log('ProductQuickView: Removing from wishlist. WishlistId:', this.wishlistId, 'ItemId:', this.wishlistItemId);
            deleteItemFromWishlist({
                wishlistId: this.wishlistId,
                wishlistItemId: this.wishlistItemId
            })
                .then(() => {
                    console.log('ProductQuickView: Removed from wishlist successfully.');
                    this.isWishlisted = false;
                    this.wishlistItemId = null;
                    this.dispatchEvent(new ShowToastEvent({
                        title: 'Success',
                        message: 'Removed from wishlist',
                        variant: 'success'
                    }));
                })
                .catch(error => {
                    console.error('ProductQuickView: Error removing from wishlist:', error);
                    this.dispatchEvent(new ShowToastEvent({
                        title: 'Error',
                        message: error.body?.message || error.message,
                        variant: 'error'
                    }));
                });
        } else {
            console.log('ProductQuickView: Adding to wishlist. WishlistId:', this.wishlistId, 'ProductId:', this.productId);
            addItemToWishlist({
                wishlistId: this.wishlistId,
                wishlistItemInput: {
                    productId: this.productId
                }
            })
                .then((result) => {
                    console.log('ProductQuickView: Added to wishlist successfully. Result:', result);
                    this.isWishlisted = true;
                    this.wishlistItemId = result.id;
                    this.dispatchEvent(new ShowToastEvent({
                        title: 'Success',
                        message: 'Added to wishlist',
                        variant: 'success'
                    }));
                })
                .catch(error => {
                    console.error('ProductQuickView: Error adding to wishlist:', error);
                    this.dispatchEvent(new ShowToastEvent({
                        title: 'Error',
                        message: error.body?.message || error.message,
                        variant: 'error'
                    }));
                });
        }
    }
}