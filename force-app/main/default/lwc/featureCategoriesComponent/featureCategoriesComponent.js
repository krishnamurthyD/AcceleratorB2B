import { LightningElement, api, wire} from 'lwc';
import swiper from '@salesforce/resourceUrl/swiper';
import { loadScript, loadStyle } from 'lightning/platformResourceLoader';
import getFeatureResponse from '@salesforce/apex/FeatureCategoriesController.getFeatureResponse';
import buttonGrowArrow from '@salesforce/resourceUrl/buttonGrowStockArrow';
import arrowIcon from '@salesforce/resourceUrl/insightResourceSliderArrow';
import { getSessionContext, getAppContext } from 'commerce/contextApi';
import { NavigationMixin } from 'lightning/navigation';

import communityId from '@salesforce/community/Id';
import isguest from '@salesforce/user/isGuest'

import siteId from '@salesforce/site/Id';

import featureCategoriesHeading from '@salesforce/label/c.Featured_Categories';
import featureCategoriesDescription from '@salesforce/label/c.Featured_Categories_Desc';
export default class FeatureCategoriesComponent extends NavigationMixin(LightningElement) {

   // @api cmsCollectionRef;
    @api cardData;
    @api startRendering = false;
    @api arrowImage;
    @api spaceBetween = 20;
    
    currentSiteId = siteId;
    _cmsCollectionRef;
    communityIdOrNetworkId = communityId;
    isGuest;

    label={
        heading: featureCategoriesHeading,  
        description: featureCategoriesDescription
    }

    _maxTilesDisplay = 6;
    
    /**
     * Sets the maximum number of tiles to display in the carousel
     * @param {number} value - Number of tiles (1-6), defaults to 2 if invalid
     */
    @api 
    set maxTilesDisplay(value) {
        if (value === undefined || value === null || !isNaN(Number(value)) && Number(value) <= 0) {
            this._maxTilesDisplay = 2;
        } else if (value > 6) {
            this._maxTilesDisplay = 6;
        } else{
            this._maxTilesDisplay = Number(value);
        }
    }

    /**
     * Gets the current maximum tiles display value
     * @returns {number} The maximum number of tiles to display
     */
    get maxTilesDisplay() {
        return this._maxTilesDisplay;
    }

    /**
     * Lifecycle hook called when component is inserted into DOM
     * Fetches guest user status and loads feature category data
     */
    async connectedCallback() {
        const session = await getSessionContext();
        if(isguest){
            this.isGuest = true;
        }else {
            this.isGuest = false;
        }
        console.log('isGuest User: ', this.isGuest);
        this.callApexForNewData(this.communityIdOrNetworkId, this.isGuest);
    }


        _cardBackgroundColor;
        
        /**
         * Sets the background color for category cards and applies it to CSS variable
         * @param {string} value - CSS color value (hex, rgb, named color, etc.)
         */
        @api
        set cardBackgroundColor(value) {
           this._cardBackgroundColor = value;
           this.setCssValueToHostElement('--card-background-color', value);
        }
        get cardBackgroundColor() {
           return this._cardBackgroundColor;
        }


        _contentAlignment= 'left';
        
        /**
         * Sets the text alignment for card content (left, center, right)
         * @param {string} value - CSS text-align value
         */
        @api
        set contentAlignment(value){
            this.setCssValueToHostElement('--content-alignment', value);
        }

        get contentAlignment(){
            return this._contentAlignment;
        }

        _cardHeadingTextColor;
        /**
         * Sets the text color for category card headings
         * @param {string} value - CSS color value
         */
        @api 
        set cardHeadingTextColor(value) {
            this._cardHeadingTextColor = value;
            this.setCssValueToHostElement('--card-title-text-color', value);
         }
         get cardHeadingTextColor() {
            return this._cardHeadingTextColor;
        }

        _cardDescriptionTextColor;
        /**
         * Sets the text color for category card descriptions
         * @param {string} value - CSS color value
         */
        @api 
        set cardDescriptionTextColor(value) {
            this._cardDescriptionTextColor = value;
            this.setCssValueToHostElement('--card-description-text-color', value);
         }
         get cardDescriptionTextColor() {
            return this._cardDescriptionTextColor;
         }

         _borderRadius = 8;
         /**
          * Sets the border radius for category cards in pixels
          * @param {number} value - Border radius value (converted to px)
          */
         @api
         set borderRadius(value) {
            this.setCssValueToHostElement('--card-border-radius', value + 'px');
        }
        get borderRadius() {
            return this._borderRadius;
        }

         _buttonBackgroundColor;
        /**
         * Sets the background color for category card buttons
         * @param {string} value - CSS color value
         */
        @api 
        set buttonBackgroundColor(value) {
            this._buttonBackgroundColor = value;
            this.setCssValueToHostElement('--card-button-background-color', value);
        }
        get buttonBackgroundColor() {
            return this._buttonBackgroundColor;
        }


        _buttonBackgroundHoverColor;
        /**
         * Sets the background color for buttons on hover state
         * @param {string} value - CSS color value
         */
        @api
        set buttonBackgroundHoverColor(value) {
            this._buttonBackgroundHoverColor = value;
            this.setCssValueToHostElement('--card-button-background-color-hover', value);
        }

        get buttonBackgroundHoverColor() {
            return this._buttonBackgroundHoverColor;
        }

        _buttonTextColor;
        /**
         * Sets the text color for category card buttons
         * @param {string} value - CSS color value
         */
        @api
        set buttonTextColor(value) {
            this._buttonTextColor = value;
            this.setCssValueToHostElement('--card-button-text-color', value);
        }

        get buttonTextColor() {
            return this._buttonTextColor;
        }

        _buttonTextHoverColor;
        /**
         * Sets the text color for buttons on hover state
         * @param {string} value - CSS color value
         */
        @api
        set buttonTextHoverColor(value) {
            this._buttonTextHoverColor = value;
            this.setCssValueToHostElement('--card-button-text-color-hover', value);
        }

        get buttonTextHoverColor() {
            return this._buttonTextHoverColor;
        }



        /**
         * Applies dynamic CSS custom properties for arrow and button icons
         * Called during component rendering to set icon URLs from static resources
         */
        applyDynamicCssValuesToCard() {

         this.template.host.style.setProperty('--arrow-icon', `url(${arrowIcon})`);
         this.setCssValueToHostElement('--link-icon', `url("${buttonGrowArrow}")`);
        }

    /**
     * Helper function to set CSS custom property on the component's host element
     * @param {string} variable - CSS custom property name (e.g., '--card-background-color')
     * @param {string} value - CSS value to set
     */
    setCssValueToHostElement(variable, value) {
        this.template.host.style.setProperty(variable, value);
    }


    /**
     * Fetches feature category data from Apex based on community context and user type
     * Filters results by maxTilesDisplay and initializes the Swiper carousel
     * @param {string} communityIdOrNetworkId - Salesforce community/network ID
     * @param {boolean} guestClientRequested - Whether the user is a guest
     */
    callApexForNewData(communityIdOrNetworkId, guestClientRequested){
        getFeatureResponse({communityIdOrNetworkId : communityIdOrNetworkId, guestClientRequested: guestClientRequested}).then(result =>{
            console.log('New Feature Data',JSON.stringify(result, null,2));
            if(this.maxTilesDisplay && result.length > this.maxTilesDisplay){
                this.cardData = result.slice(0, this.maxTilesDisplay);
            } else {
                this.cardData = result;
            }
            console.log('Apex featureCard Data', this.cardData);
            if(this.cardData.length < 2){
                this.startRendering = false;
            }else {
                this.startRendering = true;
            }
            // Wait for next render cycle, then init Swiper
            setTimeout(() => this.initSwiper(), 100);
            console.log('featureCardData', this.cardData);
        }).catch((error)=>{
            console.error('Error fetching new feature data:', error);
        })
    }



    /**
     * Enables or disables Swiper autoplay functionality
     * @param {boolean|string} value - True/false or "true"/"false" string
     */
    @api
    set enableAutoplay(value) {
        this._enableAutoplay = (value === true || value === "true");
        this.reinitSwiper();
    }
    get enableAutoplay() {
        return this._enableAutoplay;
    }

    /**
     * Sets the delay between autoplay transitions in milliseconds
     * @param {number|string} value - Delay in ms, defaults to 3000 if invalid
     */
    @api
    set autoplayDelay(value) {
        this._autoplayDelay = Number(value) || 3000;
        this.reinitSwiper();
    }
    get autoplayDelay() {
        return this._autoplayDelay;
    }

    /**
     * Enables or disables infinite loop mode for Swiper
     * @param {boolean|string} value - True/false or "true"/"false" string
     */
    @api
    set enableLoop(value) {
        this._enableLoop = (value === true || value === "true");
        this.reinitSwiper();
    }
    get enableLoop() {
        return this._enableLoop;
    }


    /**
     * Destroys and reinitializes the Swiper instance
     * Called when autoplay, loop, or delay settings change
     */
    reinitSwiper() {
        if (this.swiperInstance) {
            this.swiperInstance.destroy(true, true);
            this.swiperInitialized = false;
        }

        // Wait for DOM to update
        setTimeout(() => {
            this.initSwiper();
        }, 50);
    }



    /**
     * Lifecycle hook called after component renders
     * Applies CSS values and loads Swiper library resources once
     */
    renderedCallback() {
        this.applyDynamicCssValuesToCard();
       
        if (this.swiperResourcesLoaded) return;
        this.swiperResourcesLoaded = true;

        Promise.all([
                loadScript(this, swiper + "/swiper/swiper-bundle.min.js"),
                loadStyle(this, swiper + "/swiper/swiper-bundle.min.css")
            ])
            .then(() => {
                console.log("Slider Loaded");
            })
            .catch(err => console.error("Swiper load error:", err));
    }

    swiperInitialized = false;
    swiperResourcesLoaded = false;
    swiperInstance;
    
    /**
     * Initializes the Swiper carousel with responsive breakpoints and navigation
     * Configures autoplay, loop, pagination, and arrow navigation based on screen size
     * Only runs once after Swiper library is loaded and DOM is ready
     */
    initSwiper() {
        if (!window.Swiper || this.swiperInitialized) return;

        const container = this.template.querySelector('.swiper');
        if (!container) return;

        this.swiperInitialized = true;
        const nextBtn = this.template.querySelector(".swiper-button-next");
        const prevBtn = this.template.querySelector(".swiper-button-prev");
        const paginationEl = this.template.querySelector(".swiper-pagination");

        console.log("INIT SWIPER:", container);

        this.swiperInstance = new window.Swiper(container, {
            slidesPerView: 4,
            spaceBetween: this.spaceBetween || 21,
            enteredSlides: false,
            loop: this.enableLoop,   // <-- NEW
            speed: 650,               // smooth transition speed
            resistanceRatio: 0.75,    // smooth touch drag
            autoplay: this.enableAutoplay
                ? { delay: this.autoplayDelay, disableOnInteraction: false }
                : false,
            direction: "horizontal",
            breakpoints: {
                0: {               // Mobile
                    slidesPerView: 1.15,
                    spaceBetween: 16
                },
                480: {             // Large mobile
                    slidesPerView: 1.2,
                    spaceBetween: 16
                },
                768: {             // Tablet portrait
                    slidesPerView: 2,
                    spaceBetween: 16
                },
                1024: {            // Tablet landscape / small desktop
                    slidesPerView: 3,
                    spaceBetween: 16
                },
                1280: {            // Desktop
                    slidesPerView: 4,
                    spaceBetween: this.spaceBetween || 21
                },
                1440: {            // Figma artboard exact spec
                    slidesPerView: 4,
                    spaceBetween: this.spaceBetween || 21
                }
    },
        navigation: this.showArrows
            ? { nextEl: nextBtn, prevEl: prevBtn }
            : false,
                // ✅ Enable Progress Bar Pagination
    pagination: {
        el: paginationEl,
        type: 'progressbar'
    },
            on: {
                resize: () => {
                    this.swiperInstance.changeDirection("horizontal");
                }
            }
        });

        console.log("Swiper initialized");
    }


    /**
     * Determines whether to show navigation arrows based on screen width and data count
     * @returns {boolean} True if screen width > 760px and at least 4 cards exist
     */
    get showArrows() {
        return window.innerWidth > 760 && this.cardData?.length >= 4;
    }

    /**
     * Handles click event on category tile and navigates to ProductCategory record page
     * @param {Event} event - Click event containing categoryId in dataset
     */
    handleTileClick(event) {
        event.preventDefault();
    const categoryId = event.currentTarget.dataset.categoryId;
        this[NavigationMixin.Navigate](
            {
                type: 'standard__recordPage',
                attributes: {
                    recordId: categoryId,
                    objectApiName: 'ProductCategory',
                    actionName: 'view'
                }
            },
            true // Replace current page in browser history
        );
   }

}