import {LightningElement, wire, api } from 'lwc';
import swiper from '@salesforce/resourceUrl/swiper';
import { loadScript, loadStyle } from 'lightning/platformResourceLoader';
import arrowIcon from '@salesforce/resourceUrl/insightResourceSliderArrow';
import getTrendingProducts from '@salesforce/apex/TrendingProductsCardController.getTrendingProducts';
import { ProductAdapter, getProductPricingCollection } from 'commerce/productApi';
import { getAppContext, getSessionContext } from 'commerce/contextApi';
import isguest from '@salesforce/user/isGuest'

import { addItemToCart } from 'commerce/cartApi';
import { addItemToWishlist, WishlistAdapter, deleteItemFromWishlist } from 'commerce/wishlistApi';

import trendingProductsHeading from '@salesforce/label/c.Trending_Products';
import trendingProductsSubtitle from '@salesforce/label/c.Trending_Products_Desc';




export default class TrendingProductsCardComponent extends LightningElement {

    @api maxTilesDisplay = 4;
    @api spaceBetween = 20;
    @api enableAutoplay = false;
    @api enableLoop = false;
    swiperScriptLoaded = false;
    dataReady = false;
    

    @api products;
    // data
    productIds = [];
    productId;
    productDataList = [];
    pricingCollection = [];

    // state flags
    startRendering = false;
    counter = 0;
    swiperResourcesLoaded = false;
    swiperInitialized = false;
    swiperSecondInitialized = false;
    effectiveAccountId;



    label = {
        heading: trendingProductsHeading,
        description: trendingProductsSubtitle
    };


    webstoreId;
    async connectedCallback() {

        const appContext = await getAppContext();
        console.log('App Context:', appContext);

        this.webstoreId = appContext.webstoreId;
        if(!isguest){
            this.effectiveAccountId = await this.getEffectiveAccountId();

        } else {
            this.effectiveAccountId = null;
        }
        console.log('Webstore Id:', this.webstoreId);
        console.log('Effective Account Id:', this.effectiveAccountId);
        this.callApexToGetTrendingProducts();

    }



    async getEffectiveAccountId() {
        const sessionContext = await getSessionContext();
        const {
            effectiveAccountId
        } = sessionContext;
        return String(effectiveAccountId);
    }

    // @api a = "0ZEgK0000002CQ5WAM";
    // @api b = "3orgK000001f2zlQAA";
    // @api c = "001gK00000SOAXa";
    wishlistId;
    @wire(WishlistAdapter, {
        wishlistId: '$wishlistId'
    })
    wishlistData({
        data,
        error
    }) {
        if (data) {
            console.log('Wishlist Data:', JSON.stringify(data, null, 2));
        data.page.items.forEach((item) => {
                const product = this.productDataList.find(prod => prod.id === item.productSummary.productId);
                if (product) {
                    product.isWishlisted = true;
                    product.wishlist = {
                        wishlistItemId: item.wishlistItemId,
                        isWishlisted: true
                    };
                }
            });
            console.log('Updated Product Data List with Wishlist Info:', JSON.stringify(this.productDataList, null, 2));
        } else if (error) {
            console.error('WishlistAdapter error:', JSON.stringify(error, null, 2));
        }
    }


    // ---------- PRODUCT + PRICING MERGE ----------

    @wire(ProductAdapter, {
        productId: '$productId',
        excludeEntitlementDetails: true
    })
    getProductDetails({
        data,
        error
    }) {
        if (data) {
            const allMedia = (data.mediaGroups || [])
                .flatMap(group => group.mediaItems || [])
                .map((m, index) => ({
                    url: `/sfsites/c${m.url}`,
                    altText: m.alternateText || 'productImage',
                    id: `${data.id}_img_${index}`
                }));

            // merge images into existing product entry
            this.productDataList = this.productDataList.map(item => (
                item.id === data.id 
                    ? { ...item, images: allMedia }
                    : item
            ));

            console.log('Product Data pp:', JSON.stringify(data.id, null, 2));
            console.log('Fetched Product Data:', JSON.stringify(data, null, 2));

            this.counter++;
            if (this.counter < this.productIds.length) {
                // trigger next ProductAdapter wire
                this.productId = this.productIds[this.counter];
            } else {
                console.log('Final Product List:', JSON.stringify(this.productDataList, null, 2));
                this.dataReady = true;
                this.startRendering = true;
                this.tryInitSwipers();
            }
        } else if (error) {
            console.error('ProductAdapter error:', error);
        }
    }

    callApexToGetTrendingProducts() {
        getTrendingProducts({
                effectiveAccountId: this.effectiveAccountId,
                webStoreId: this.webstoreId
            })
            .then(result => {
                console.log('✅ Trending Products:', JSON.stringify(result, null, 2));

                // ✅ Use lowercase field names from Apex
                this.productIds = result.trendingProducts.map(product => product.id);

                this.productDataList = result.trendingProducts.map(product => ({
                    id: product.id, // ✅ lowercase
                    name: product.name, // ✅ lowercase
                    sku: product.sku, // ✅ lowercase
                    quantity: 1,
                    rating: product.averageRating || 0, // ✅ use real rating
                    ratingCount: product.reviewCount || 0, // ✅ use real count
                    isWishlisted: false,
                    wishlist: {
                        wishlistItemId: null,
                        isWishlisted: false
                    },
                    images: [],
                    hideWishlist: result.wishlistId == null ? true : false
                }));

                if (this.productIds.length) {
                    this.productId = this.productIds[0];
                }

                if(result.wishlistId != null){
                    this.wishlistId = result.wishlistId;
                }

                this.fetchProductPricingDetails(this.productIds);
            })
            .catch(error => {
                console.error('❌ Error:', error);
            });
    }


    fetchProductPricingDetails(productIds) {
        getProductPricingCollection({
                productIds
            })
            .then(pricingCollection => {
                console.log(
                    'Product Pricing Collection:',
                    JSON.stringify(pricingCollection, null, 2)
                );

                this.pricingCollection = pricingCollection.pricingLineItemResults.map(
                    item => {
                        return {
                        productId: item.productId,
                        listPrice: item.listPrice,
                        unitPrice: item.unitPrice,
                        currencyIsoCode: pricingCollection.currencyIsoCode
                    };
            });

                // merge pricing into productDataList
                this.productDataList = this.productDataList.map(product => {
                    const pricingInfo = this.pricingCollection.find(
                        price => price.productId === product.id
                    );
                    return {
                        ...product,
                        listPrice: pricingInfo ? pricingInfo.listPrice : null,
                        unitPrice: pricingInfo ? pricingInfo.unitPrice : null,
                        currencyIsoCode: pricingInfo ? pricingInfo.currencyIsoCode : null
                    };
                });


            })
            .catch(error => {
                console.error('Error fetching product pricing collection:', error);
            });
    }

    // ---------- STYLE + SCRIPT LOADING ----------

    applyDynamicCssValuesToCard() {
        this.template.host.style.setProperty('--arrow-icon', `url(${arrowIcon})`);
    }

    renderedCallback() {
        this.applyDynamicCssValuesToCard();

        if (this.swiperResourcesLoaded) {
            return;
        }
        this.swiperResourcesLoaded = true;

        Promise.all([
                loadScript(this, swiper + '/swiper/swiper-bundle.min.js'),
                loadStyle(this, swiper + '/swiper/swiper-bundle.min.css')
            ])
            .then(() => {
                console.log('Swiper files loaded');
                this.swiperScriptLoaded = true;
                this.tryInitSwipers();
            })
            .catch(err => console.error('Swiper load error:', err));
    }

    // ---------- SWIPER INITIALIZATION ----------

    tryInitSwipers() {
        if (!this.swiperScriptLoaded || !this.dataReady) return;

        requestAnimationFrame(() => {
            this.initMainSwiper();
            this.initInnerSwipers();
        });
    }


    initMainSwiper() {
        if (!window.Swiper || this.swiperInitialized) return;

        const container = this.template.querySelector('.trending-slider.swiper');
        if (!container) return;

        const nextBtn = this.template.querySelector(
            '.trending-slider-btn.swiper-button-next'
        );
        const prevBtn = this.template.querySelector(
            '.trending-slider-btn.swiper-button-prev'
        );
        const paginationEl = this.template.querySelector(
            '.trending-slider-pagination.swiper-pagination'
        );

        console.log('INIT MAIN SWIPER:', container);

        this.swiperInstance = new window.Swiper(container, {
            slidesPerView: 4,
            spaceBetween: this.spaceBetween || 21,
            loop: this.enableLoop,
            speed: 650,
            resistanceRatio: 0.75,
            autoplay: this.enableAutoplay ?
                {
                    delay: this.autoplayDelay || 3000,
                    disableOnInteraction: false
                } :
                false,
            direction: 'horizontal',
            breakpoints: {
                0: {
                    slidesPerView: 1.15,
                    spaceBetween: 16
                },
                480: {
                    slidesPerView: 1.2,
                    spaceBetween: 16
                },
                768: {
                    slidesPerView: 2,
                    spaceBetween: 16
                },
                1024: {
                    slidesPerView: 3,
                    spaceBetween: 16
                },
                1280: {
                    slidesPerView: 4,
                    spaceBetween: this.spaceBetween || 20
                },
                1440: {
                    slidesPerView: 4,
                    spaceBetween: this.spaceBetween || 20
                }
            },
            navigation: this.showArrows ?
                {
                    nextEl: nextBtn,
                    prevEl: prevBtn
                } :
                false,
            pagination: {
                el: paginationEl,
                type: 'progressbar'
            }
        });

        this.swiperInitialized = true;
        console.log('Main Swiper initialized');
    }

    initInnerSwipers() {
        if (!window.Swiper || this.swiperSecondInitialized) return;

        const productCards = this.template.querySelectorAll('.product-card');
        if (!productCards.length) {
            requestAnimationFrame(() => this.initInnerSwipers());
            return;
        }

        productCards.forEach((card, index) => {
            const sliderEl = card.querySelector('.image-wrapper.swiper');
            const paginationEl = card.querySelector('.image-wrapper .swiper-pagination');
            if (!sliderEl) {
                console.warn('No inner slider found for card index', index);
                return;
            }

            const innerSwiper = new window.Swiper(sliderEl, {
                slidesPerView: 1,
                loop: true,
                speed: 500,
                resistanceRatio: 0.65,
                nested: true,
                autoplay: {
                    delay: 2500,
                    disableOnInteraction: false,
                    pauseOnMouseEnter: false
                },
                pagination: paginationEl ?
                    {
                        el: paginationEl,
                        type: 'progressbar'
                    } :
                    undefined
            });

            // Start stopped; only run when hovering the card
            if (innerSwiper.autoplay && innerSwiper.autoplay.running) {
                innerSwiper.autoplay.stop();
            }

            const imageArea =
                card.querySelector('.image-inner-wrapper') || sliderEl;

            // Card hover: start/stop autoplay
            card.addEventListener('mouseenter', () => {
                if (!innerSwiper.autoplay.running) innerSwiper.autoplay.start();
            });
            card.addEventListener('mouseleave', () => {
                if (innerSwiper.autoplay.running) innerSwiper.autoplay.stop();
            });

            // Image hover: pause/resume while staying on the card
            imageArea.addEventListener('mouseenter', () => {
                if (innerSwiper.autoplay.running) innerSwiper.autoplay.stop();
            });
            imageArea.addEventListener('mouseleave', () => {
                if (card.matches(':hover') && !innerSwiper.autoplay.running) {
                    innerSwiper.autoplay.start();
                }
            });
        });

        this.swiperSecondInitialized = true;
        console.log('Inner Swipers initialized');
    }

    // ---------- HELPERS ----------

    get showArrows() {
        const count = this.productDataList ? this.productDataList.length : 0;
        return window.innerWidth > 760 && count >= 4;
    }

    handleIncreaseQty(event) {
        const id = event.currentTarget.dataset.id;
        const idx = this.productDataList.findIndex(x => x.id === id);
        if (idx !== -1) {
            this.productDataList[idx].quantity++;
            this.productDataList = [...this.productDataList];
        }
    }

    handleDecreaseQty(event) {
        const id = event.currentTarget.dataset.id;
        const idx = this.productDataList.findIndex(x => x.id === id);
        if (idx !== -1 && this.productDataList[idx].quantity > 1) {
            this.productDataList[idx].quantity--;
            this.productDataList = [...this.productDataList];
        }
    }


    // @api wishlistId;
    
    addToCartHandler(event) {
        const productId = event.currentTarget.dataset.id;
        const product = this.productDataList.find(p => p.id === productId);
        if (!product) {
            console.error('Product not found for ID:', productId);
            return;
        }

        const quantity = product.quantity || 1;

        addItemToCart(
            productId,
            quantity
        ).then((result) => {
            console.log(`Added to cart: ${productId} (Qty: ${quantity}) ${result}`);
        }).catch(error => {
            console.error('Error adding to cart:', error);
        });
    }


    handleAddtoWishlist(event) {
        const productId = event.currentTarget.dataset.id;
        addItemToWishlist({
                webstoreId: this.webstoreId,
                wishlistItemInput: {
                    "productId": productId,
                }
            })
            .then(result => {
                console.log('Success', 'Item added to wishlist', result);
                // this.productDataList.find(prod=>prod.id === productId).isWishlisted = true;
                this.productDataList.find(prod => prod.id === productId).wishlist = {
                    wishlistItemId: result.id,
                    isWishlisted: true
                };
                this.productDataList = [...this.productDataList];
            })
            .catch(error => {
                console.error('Error', error.body.message);
            });
    }

    handleRemoveFromWishlist(event) {
        const productId = event.currentTarget.dataset.id;
        const wishlistItemId = this.productDataList.find(prod => prod.id === productId).wishlist.wishlistItemId;
        console.log('Removing wishlist item with ID:', wishlistItemId);

        deleteItemFromWishlist({
                webstoreId: this.webstoreId,
                wishlistId: this.wishlistId,
                wishlistItemId: wishlistItemId
            })
            .then(() => {
                console.log('Success', 'Item removed from wishlist');
                this.productDataList.find(prod => prod.id === productId).wishlist = {
                    wishlistItemId: null,
                    isWishlisted: false
                };
                this.productDataList = [...this.productDataList];
            })
            .catch(error => {
                console.error('Error', error.body.message);
            });
    }
}