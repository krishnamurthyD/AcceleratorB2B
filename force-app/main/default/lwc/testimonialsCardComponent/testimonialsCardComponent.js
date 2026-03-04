import { LightningElement, api } from 'lwc';
import userDefaultIcon from '@salesforce/resourceUrl/userDefaultIcon';
import baseUrlOfStaticResource from '@salesforce/resourceUrl/testimonialResourceFile';
import getLatestTestimonials from '@salesforce/apex/TestimonialsCardController.getLatestTestimonials';

import testimonailHeading from '@salesforce/label/c.Testimonials';


export default class TestimonialsCardComponent extends LightningElement {

    startRendering = false;
    testimonials = [];
    @api speed = 3000; // default speed value
    imgSrc = userDefaultIcon;
    label = {
        heading: testimonailHeading
    };

    /**
     * Lifecycle hook called when component is inserted into DOM
     * Initiates the testimonial data fetch from Apex controller
     */
    connectedCallback() {
        this.callApexToFetchTestimonials();
    }

    /**
     * Fetches testimonial data from Apex and initializes star rating icons
     * Loads static resources for star icons (filled, half-filled, blank)
     * Maps testimonial data with generated star arrays and initializes Swiper
     */
    callApexToFetchTestimonials() {
        this.filledStar = baseUrlOfStaticResource + '/testimonial/fullFill.svg';
        this.halfFilledStar = baseUrlOfStaticResource + '/testimonial/halfFill.svg';
        this.blankStar = baseUrlOfStaticResource + '/testimonial/blankStar.svg';
        getLatestTestimonials()
            .then((result) => {
                this.testimonials = result.map(item => {
                    return {
                        ...item,
                        stars: this.generateStars(item.rating)
                    };
                });

                console.log('Fetched testimonials:', this.testimonials);
                setTimeout(() => this.initSwiper(), 100);
                this.startRendering = true;
            })
            .catch(error => {
                console.error("Error fetching testimonials:", error);
            });
    }

    /**
     * Generates an array of star objects based on a numeric rating (0-5)
     * Creates filled, half-filled, and empty star objects for visual display
     * @param {number} rating - The testimonial rating (e.g., 4.5)
     * @returns {Array<Object>} Array of 5 star objects with filled/half/empty properties
     */
    generateStars(rating) {
        const stars = [];
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

        for (let i = 0; i < fullStars; i++) {
            stars.push({
                filled: true,
                half: false,
                empty: false
            });
        }
        if (hasHalfStar) {
            stars.push({
                filled: false,
                half: true,
                empty: false
            });
        }
        for (let i = 0; i < emptyStars; i++) {
            stars.push({
                filled: false,
                half: false,
                empty: true
            });
        }

        return stars;
    }


    swiperInitialized = false;
    swiperResourcesLoaded = false;
    swiperInstance;
    enableLoop = true;
    @api autoplayDelay = 4000;

    /**
     * Initializes the Swiper carousel for testimonials
     * Configures responsive breakpoints, autoplay, pagination, and accessibility
     * Features continuous auto-scroll, smooth transitions, and mobile touch support
     * Only initializes once after Swiper library is loaded and DOM is ready
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
            // ----- LAYOUT -----
            slidesPerView: 3,
            spaceBetween: 40,
            loop: true,
            centeredSlides: false,
            loopAdditionalSlides: 3,
            // ----- AUTO-SCROLL -----
            autoplay: {
                delay: 5, // no pause between slides
                disableOnInteraction: false, // resume after user swipe
                pauseOnMouseEnter: true
            },

            // Smooth animation
            speed: this.speed, // speed of transition
            resistanceRatio: 0.75, // smooth touch drag

            // ----- PAGINATION -----
            pagination: {
                el: paginationEl,
                clickable: true,
                type: 'bullets', // desktop/tablet = dots
                dynamicBullets: false
            },
            freeMode: false,
            freeModeMomentum: false,

            // ----- BREAKPOINTS (Responsive) -----
            breakpoints: {
                // MOBILE (shows 1 full card + partial next card)
                0: {
                    slidesPerView: 1.1,
                    spaceBetween: 16,
                    pagination: this.testimonials.length > 3 ? {
                        el: paginationEl,
                        type: 'progressbar'
                    } : null
                },

                // TABLET PORTRAIT
                768: {
                    slidesPerView: 2,
                    spaceBetween: 16
                },

                // TABLET LANDSCAPE
                1024: {
                    slidesPerView: 3,
                    spaceBetween: 16
                },

                // DESKTOP
                1280: {
                    slidesPerView: 3,
                    spaceBetween: 40,
                    pagination: this.testimonials.length > 3 ? {
                        el: paginationEl,
                        type: 'bullets',
                        clickable: true
                    } : null,
                }
            },

            // ----- ACCESSIBILITY -----
            a11y: {
                enabled: true,
                slideRole: 'group',
                containerRoleDescriptionMessage: 'Testimonials carousel',
                slideLabelMessage: '{{index}} / {{slidesLength}}',
            },

            // ----- ARROWS (if needed in future) -----
            navigation: false,

            // ----- TOUCH / GESTURES -----
            touchStartPreventDefault: true,
            allowTouchMove: true // swipe allowed on mobile
        });

            // Hover controls
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
            }, 10);
        });
    }

        console.log("Swiper initialized");
    }

    /**
     * Determines whether to show navigation arrows based on screen width and testimonial count
     * @returns {boolean} True if screen width > 760px and at least 4 testimonials exist
     */
    get showArrows() {
        return window.innerWidth > 760 && this.testimonials?.length >= 4;
    }

}