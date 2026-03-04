import { LightningElement, api, track, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { NavigationMixin } from 'lightning/navigation';
import { addItemToCart } from 'commerce/cartApi';
import { addItemToWishlist, deleteItemFromWishlist, WishlistsAdapter } from 'commerce/wishlistApi';

export default class ProductCard extends NavigationMixin(LightningElement) {
    @api product; // The ProductWrapper object
    @api displayMode = 'grid'; // 'grid' or 'list'
    @api maxQuantity = 10;

    @track isWishlisted = false;
    @track wishlistItemId;
    @track wishlistId;

    @wire(WishlistsAdapter, {
        includeDisplayedList: true,
        pageSize: 500
    })
    wiredWishlists({ data, error }) {
        if (data && data.displayedList) {
            this.wishlistId = data.displayedList.summary.id;
            if (data.displayedList.page && data.displayedList.page.items) {
                const foundItem = data.displayedList.page.items.find(
                    item => item.productSummary.productId === this.product.id
                );
                if (foundItem) {
                    this.isWishlisted = true;
                    this.wishlistItemId = foundItem.wishlistItemId;
                } else {
                    this.isWishlisted = false;
                    this.wishlistItemId = null;
                }
            }
        } else if (error) {
            console.error('Error fetching wishlists:', error);
        }
    }

    get productImages() {
        if (this.product) {
            // Check for mediaGroups (Standard B2B/D2C Commerce structure)
            if (this.product.mediaGroups) {
                const listImageGroup = this.product.mediaGroups.find(group => group.developerName === 'productListImage');
                if (listImageGroup && listImageGroup.mediaItems) {
                    // Extract URLs and limit to 2
                    return listImageGroup.mediaItems.map(item => item.url).slice(0, 2);
                }
            }

            if (this.product.images) {
                return this.product.images;
            }
            if (this.product.image && this.product.image.url) {
                return [this.product.image.url];
            }
        }
        return [];
    }

    get partNumber() {
        if (!this.product) return '';
        if (this.product.sku) return this.product.sku;
        if (this.product.partNumber) return this.product.partNumber;
        if (this.product.stockKeepingUnit) return this.product.stockKeepingUnit;
        if (this.product.fields && this.product.fields.StockKeepingUnit && this.product.fields.StockKeepingUnit.value) {
            return this.product.fields.StockKeepingUnit.value;
        }
        return '';
    }

    get listingPrice() {
        return this.product?.prices?.listingPrice ? parseFloat(this.product.prices.listingPrice) : null;
    }
    
    get negotiatedPrice() {
        return this.product?.prices?.negotiatedPrice ? parseFloat(this.product.prices.negotiatedPrice) : null;
    }

    get currencyCode() {
        return this.product?.prices?.currencyIsoCode || 'USD';
    }

    get formattedListingPrice() {
        if (!this.listingPrice) return '';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: this.currencyCode
        }).format(this.listingPrice);
    }

    get formattedNegotiatedPrice() {
        if (!this.negotiatedPrice) return '';
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: this.currencyCode
        }).format(this.negotiatedPrice);
    }
    
    get discountText() {
        // Calculate discount percentage if both prices exist
        if (this.listingPrice && this.negotiatedPrice && this.listingPrice > this.negotiatedPrice) {
            const discount = ((this.listingPrice - this.negotiatedPrice) / this.listingPrice) * 100;
            return `${Math.round(discount)}% OFF Today`;
        }
        return '';
    }

    get urgencyMessage() {
        if (this.product && this.product.fields && this.product.fields.PLP_Message__c) {
            return this.product.fields.PLP_Message__c.value;
        }
        return '';
    }

    get computedBadges() {
        const badges = [];
        // Check the new Picklist Field: ProductBadge__c
        if (this.product && this.product.fields && this.product.fields.ProductBadge__c) {
            const badgeValue = this.product.fields.ProductBadge__c.value;
            // Handle null, undefined, and 'None'
            if (badgeValue && badgeValue !== 'None') {
                badges.push(badgeValue);
            }
        }
        
        // Fallback to existing badges if any
        if (this.product && this.product.badges) {
            badges.push(...this.product.badges);
        }
        return badges;
    }

    get containerClass() {
        return `product-card ${this.displayMode}`;
    }

    get isOutOfStock() {
        // Check computed badges first
        if (this.computedBadges.includes('Out Of Stock') || this.computedBadges.includes('Out of Stock')) return true;
        return this.product?.badges?.includes('Out of Stock');
    }

    // --- EVENT HANDLERS (Bubbling Up) ---

    handleWishlistToggle() {
        // Optimistic update
        const originalState = this.isWishlisted;
        const originalId = this.wishlistItemId;
        
        this.isWishlisted = !this.isWishlisted;

        if (originalState && originalId) {
            // Remove
            deleteItemFromWishlist({
                wishlistId: this.wishlistId,
                wishlistItemId: originalId
            }).then(() => {
                this.wishlistItemId = null;
                this.dispatchEvent(new ShowToastEvent({
                    title: 'Removed From Wishlist',
                    variant: 'success'
                }));
                this.dispatchEvent(new CustomEvent('wishlistchange', {
                    detail: { productId: this.product.id, added: false }
                }));
            }).catch((error) => {
                // Revert on error
                this.isWishlisted = originalState;
                this.dispatchEvent(new ShowToastEvent({
                    title: 'Error removing from wishlist',
                    message: error.body ? error.body.message : error.message,
                    variant: 'error'
                }));
            });
        } else {
            // Add
            addItemToWishlist({
                wishlistId: this.wishlistId,
                wishlistItemInput: {
                    productId: this.product.id
                }
            }).then((result) => {
                this.wishlistItemId = result.id;
                this.dispatchEvent(new ShowToastEvent({
                    title: 'Added To Wishlist',
                    variant: 'success'
                }));
                this.dispatchEvent(new CustomEvent('wishlistchange', {
                    detail: { productId: this.product.id, added: true }
                }));
            }).catch((error) => {
                // Revert on error
                this.isWishlisted = originalState;
                this.dispatchEvent(new ShowToastEvent({
                    title: 'Error adding to wishlist',
                    message: error.body ? error.body.message : error.message,
                    variant: 'error'
                }));
            });
        }
    }

    handleQuickView() {
        this.dispatchEvent(new CustomEvent('quickview', {
            detail: { productId: this.product.id }
        }));
    }

    handleViewSimilar() {
        this.dispatchEvent(new CustomEvent('viewsimilar', {
            detail: { productId: this.product.id }
        }));
    }

    handleAddToCart(event) {
        const qty = event.detail.quantity;
        
        addItemToCart(this.product.id, qty)
            .then(() => {
                this.dispatchEvent(new ShowToastEvent({
                    title: 'Success',
                    message: 'Product added to your cart',
                    variant: 'success'
                }));
                
                this.dispatchEvent(new CustomEvent('addtocart', {
                    detail: { productId: this.product.id, quantity: qty }
                }));
            })
            .catch((error) => {
                this.dispatchEvent(new ShowToastEvent({
                    title: 'Error adding to cart',
                    message: error.body ? error.body.message : error.message,
                    variant: 'error'
                }));
            });
    }

    handleNotifyMe() {
        this.dispatchEvent(new CustomEvent('notifyme', {
            detail: { productId: this.product.id }
        }));
    }

    handleMaxLimit() {
        this.dispatchEvent(new ShowToastEvent({
            title: 'You’ve exceeded the maximum allowed quantity',
            variant: 'warning'
        }));
    }

    handleNavigate() {
        // Navigate to PDP
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: this.product.id,
                objectApiName: 'Product2',
                actionName: 'view'
            }
        });
    }
}
