import { api, LightningElement } from 'lwc';
import swiper from '@salesforce/resourceUrl/swiper';
import { loadScript, loadStyle } from 'lightning/platformResourceLoader';
import getClienteleCardData from '@salesforce/apex/ClienteleCardController.getClienteleCardData';
import siteId from '@salesforce/site/Id';
import clienteleHeading from '@salesforce/label/c.Clientele';
export default class ClienteleCardComponent extends LightningElement {


    enableLoop = true;
    enableAutoplay = true;
    autoplayDelay = 0;
    cmsData;
    startRendering = false;
    currentSiteId = siteId;
    _cmsCollectionRef;
    label = {
        heading: clienteleHeading
    };
    
    /**
     * Sets the CMS collection reference and triggers data fetch
     * @param {string} value - CMS content collection ID to retrieve client logos
     */
    @api
    set cmsCollectionRef(value) {
        this._cmsCollectionRef = value;
        this.callApexForFeatureCardData(value);
    }
    
    /**
     * Gets the current CMS collection reference
     * @returns {string} The CMS content collection ID
     */
    get cmsCollectionRef() {
        return this._cmsCollectionRef;
    }

    /**
     * Fetches clientele card data from Apex controller using CMS collection ID
     * Retrieves client/brand logos from Experience Cloud CMS and initializes Swiper
     * @param {string} contentId - The CMS content collection ID
     */
    callApexForFeatureCardData(contentId) {
        getClienteleCardData({
                siteId: this.currentSiteId,
                contentId: contentId
            })
            .then((result) => {
                console.log('Apex getClienteleCardData result:', result);
                this.cmsData = result;
                this.startRendering = true;
                // Wait for next render cycle, then init Swiper
                setTimeout(() => this.initSwiper(), 100);
                console.log('InsightCardData', this.cardData);
            })
            .catch((error) => {
                console.error('Apex call error:', error);
            });
    }

    /**
     * Lifecycle hook called after component renders
     * Loads Swiper library resources (JS and CSS) once from static resources
     */
    renderedCallback() {
        if (this.swiperResourcesLoaded) return;
        this.swiperResourcesLoaded = true;

        Promise.all([
                loadScript(this, swiper + "/swiper/swiper-bundle.min.js"),
                loadStyle(this, swiper + "/swiper/swiper-bundle.min.css")
            ])
            .then(() => {
                console.log("Slider files loaded");
            })
            .catch(err => console.error("Swiper load error:", err));
    }

    swiperInitialized = false;
    swiperResourcesLoaded = false;
    swiperInstance;
    spaceBetween = 64;
    
    /**
     * Initializes the Swiper carousel with continuous auto-scroll marquee effect
     * Configures responsive breakpoints, free mode for smooth continuous movement
     * Features infinite loop, no user interaction delay, and horizontal scrolling
     * Only initializes once after Swiper library is loaded and DOM is ready
     */
    initSwiper() {
        if (!window.Swiper || this.swiperInitialized) return;

        const container = this.template.querySelector('.swiper');
        if (!container) return;

        this.swiperInitialized = true;


        console.log("INIT SWIPER:", container);

        this.swiperInstance = new window.Swiper(container, {
            slidesPerView: "auto",
            spaceBetween: this.spaceBetween || 21,
            enteredSlides: false,
            loop: this.enableLoop, // <-- NEW
            speed: 1000, // smooth transition speed
            resistanceRatio: 0.75, // smooth touch drag
            autoplay: {
                delay: 0,
                disableOnInteraction: false
            },
            direction: "horizontal",
            freeMode: true,
            freeModeMomentum: false, // lower = slower marquee, higher = faster
            breakpoints: {
                0: { // Mobile
                    slidesPerView: 1.15,
                    spaceBetween: 20
                },
                480: { // Large mobile
                    slidesPerView: 1.2,
                    spaceBetween: 20
                },
                768: { // Tablet portrait
                    slidesPerView: 2,
                    spaceBetween: 20
                },
                1024: { // Tablet landscape / small desktop
                    slidesPerView: 3,
                    spaceBetween: 20
                },
                1280: { // Desktop
                    slidesPerView: 5,
                    spaceBetween: 64
                },
                1440: { // Figma artboard exact spec
                    slidesPerView: 5,
                    spaceBetween: 64
                }
            },
            autoplay: {
                delay: this.autoplayDelay,
                disableOnInteraction: true,
                waitForTransition: true
            },
            navigation: false,
                on: {
                    tap: () => this.resumeAutoplay(),
                    swiper: () => this.resumeAutoplay(),
                    resize: () => {
                        this.swiperInstance.changeDirection("horizontal");
                    }
                }
        });

                const swiperWrapper = this.template.querySelector('.swiper');
        if (swiperWrapper) {
            swiperWrapper.addEventListener('mouseenter', () => {
                console.log("Mouse entered - stopping autoplay");
                this.swiperInstance.autoplay.stop();
            });

            swiperWrapper.addEventListener('mouseleave', () => {
                console.log("Mouse left - resuming autoplay");
                setTimeout(() => {
                    this.swiperInstance.autoplay.start();
                }, 5);
            });
        }

        console.log("Swiper initialized");
    }

    resumeAutoplay() {
        if (this.swiperInstance && this.swiperInstance.autoplay) {
            this.swiperInstance.autoplay.start();
        }
    }

}