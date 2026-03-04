import { LightningElement, api, wire} from 'lwc';
import swiper from '@salesforce/resourceUrl/swiper';
import { loadScript, loadStyle } from 'lightning/platformResourceLoader';
import getInsightCardResponse from '@salesforce/apex/InsightsResourcesController.getCardDataList';
import arrowIcon from '@salesforce/resourceUrl/insightResourceSliderArrow';

import siteId from '@salesforce/site/Id';

import insightCardHeading from '@salesforce/label/c.Insights_Resources';
import insightCardDescription from '@salesforce/label/c.Insights_Resources_Desc';
export default class InsightsResourcesCardComponent extends LightningElement {

   // @api cmsCollectionRef;
    @api cardData;
    @api startRendering = false;
    @api arrowImage;
    @api spaceBetween = 21;
    @api maxTilesDisplay = 6;
    currentSiteId = siteId;
    _cmsCollectionRef;

    label = {
        heading: insightCardHeading,
        description: insightCardDescription
    };


        _cardBackgroundColor;
        @api 
        set cardBackgroundColor(value) {
           this._cardBackgroundColor = value;
           this.setCssValueToHostElement('--card-background-color', value);
        }
        get cardBackgroundColor() {
           return this._cardBackgroundColor;
        }


       _timeLineTextColor;
        @api 
        set timeLineTextColor(value) {
            this._timeLineTextColor = value;
            this.setCssValueToHostElement('--card-time-line-text-color', value);
         }
         get timeLineTextColor() {
            return this._timeLineTextColor;
         }

        _cardHeadingTextColor;
        @api 
        set cardHeadingTextColor(value) {
            this._cardHeadingTextColor = value;
            this.setCssValueToHostElement('--card-title-text-color', value);
         }
         get cardHeadingTextColor() {
            return this._cardHeadingTextColor;
        }

        _cardDescriptionTextColor;
        @api 
        set cardDescriptionTextColor(value) {
            this._cardDescriptionTextColor = value;
            this.setCssValueToHostElement('--card-description-text-color', value);
         }
         get cardDescriptionTextColor() {
            return this._cardDescriptionTextColor;
         }  

         _buttonBackgroundColor;
        @api 
        set buttonBackgroundColor(value) {
            this._buttonBackgroundColor = value;
            this.setCssValueToHostElement('--card-button-background-color', value);
        }
        get buttonBackgroundColor() {
            return this._buttonBackgroundColor;
        }


        _buttonBackgroundHoverColor;
        @api
        set buttonBackgroundHoverColor(value) {
            this._buttonBackgroundHoverColor = value;
            this.setCssValueToHostElement('--card-button-background-color-hover', value);
        }

        get buttonBackgroundHoverColor() {
            return this._buttonBackgroundHoverColor;
        }

        _buttonTextColor;
        @api
        set buttonTextColor(value) {
            this._buttonTextColor = value;
            this.setCssValueToHostElement('--card-button-text-color', value);
        }

        get buttonTextColor() {
            return this._buttonTextColor;
        }

        _buttonTextHoverColor;
        @api
        set buttonTextHoverColor(value) {
            this._buttonTextHoverColor = value;
            this.setCssValueToHostElement('--card-button-text-color-hover', value);
        }

        get buttonTextHoverColor() {
            return this._buttonTextHoverColor;
        }


    applyDynamicCssValuesToCard() {
         this.template.host.style.setProperty('--arrow-icon', `url(${arrowIcon})`);
    }

    // helper function to set CSS variable on component host
    setCssValueToHostElement(variable, value) {
        this.template.host.style.setProperty(variable, value);
    }
    
    @api
    set cmsCollectionRef(value) {
        this._cmsCollectionRef = value;
        this.callApexForInsightCardData();
    }
    get cmsCollectionRef() {
        return this._cmsCollectionRef;
    }



    callApexForInsightCardData() {
        console.log('Calling Apex for InsightCard with siteId:', this.currentSiteId, 'and contentId:', this.cmsCollectionRef);
        getInsightCardResponse({ siteId: this.currentSiteId, contentId: this.cmsCollectionRef }).then(result => {
            if(this.maxTilesDisplay && result.length > this.maxTilesDisplay){
                this.cardData = result.slice(0, this.maxTilesDisplay);
            } else {
                this.cardData = result;
            }
            console.log('Apex InsightCard Data', this.cardData);
            this.startRendering = true;
            // Wait for next render cycle, then init Swiper
            setTimeout(() => this.initSwiper(), 100);
            console.log('InsightCardData', this.cardData);
        }).catch((error)=>{
            console.error('Apex call error:', error);
        });
    }


    _enableAutoplay = false;
    _autoplayDelay = 3000;
    _enableLoop = false;
    @api
    set enableAutoplay(value) {
        this._enableAutoplay = (value === true || value === "true");
        this.reinitSwiper();
    }
    get enableAutoplay() {
        return this._enableAutoplay;
    }

    @api
    set autoplayDelay(value) {
        this._autoplayDelay = Number(value) || 3000;
        this.reinitSwiper();
    }
    get autoplayDelay() {
        return this._autoplayDelay;
    }

    @api
    set enableLoop(value) {
        this._enableLoop = (value === true || value === "true");
        this.reinitSwiper();
    }
    get enableLoop() {
        return this._enableLoop;
    }


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



    renderedCallback() {
        this.applyDynamicCssValuesToCard();
       
        if (this.swiperResourcesLoaded) return;
        this.swiperResourcesLoaded = true;

        Promise.all([
                loadScript(this, swiper + "/swiper/swiper-bundle.min.js"),
                loadStyle(this, swiper + "/swiper/swiper-bundle.min.css")
            ])
            .then(() => {
                console.log("Swiper files loaded");
                //this.updateSlider();
                // if (this.startRendering) {
                //     this.initSwiper();
                // }
            })
            .catch(err => console.error("Swiper load error:", err));
    }

    swiperInitialized = false;
    swiperResourcesLoaded = false;
    swiperInstance;

    /** STEP 4: Initialize Swiper after components exist */
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
                    spaceBetween: 20
                },
                480: {             // Large mobile
                    slidesPerView: 1.2,
                    spaceBetween: 20
                },
                768: {             // Tablet portrait
                    slidesPerView: 2,
                    spaceBetween: 18
                },
                1024: {            // Tablet landscape / small desktop
                    slidesPerView: 3,
                    spaceBetween: 20
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


    get showArrows() {
        return window.innerWidth > 760 && this.cardData?.length >= 4;
    }

    handleTileClick(event) {
    const url = event.currentTarget.dataset.url;
    if (url) {
        window.location.href = url;
        }
   }

}