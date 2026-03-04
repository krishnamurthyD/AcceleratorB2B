/**
 * @description
 * 
 *  -------------------------------------
 *  This Lightning Web Component displays a carousel of up to three CMS images with optional headings and buttons.
 *  It supports navigation between images and exposes slots for custom headings and buttons per slide.
 * 
 *  Best Practices:
 *   - Use @api properties for all configurable data to ensure reusability and flexibility.
 *   - Use getter methods for computed properties to keep template logic clean.
 *   - Use @track for reactive state that affects rendering.
 *   - Document all public properties and slots for clarity and maintainability.
 *   - Keep navigation logic simple and cyclic for a seamless user experience.
 */

import { LightningElement, api, track } from 'lwc';

/**
 *@slot bannerHeading1
 *@slot bannerHeading2
 *@slot bannerHeading3
 *@slot bannerButton1
 *@slot bannerButton2
 *@slot bannerButton3
 */

export default class B2bHomePageMainCarousel extends LightningElement {
    @api cmsImage1;
    @api cmsImage2;
    @api cmsImage3;
    @api minHeight;          // px
    @api bannerWidth;        // %
    @api horizontalAlign;    // left / center / right
    @api padding;            // Small, Medium, Large
    @api backgroundColor;    // hex or name
    @api borderColor;
    @api borderWeight;       // px
    @api borderRadius;       // px
    @api imageAlignment;     // Stretch to fit / Scale to fit
    @api imageUrl; 

    /* desc- base path */
    @api baseUrl = '/b2bdemone/sfsites/c/cms/delivery/media/';

    @track currentIndex = 0;
    @track fadeText = false;


    timer;

    connectedCallback() {
        // Auto-slide every 5seconds (5000ms)
        this.timer = setInterval(() => {
            this.handleNext();
        }, 5000);
    }

    disconnectedCallback() {
        // Clear interval when component is destroyed
        clearInterval(this.timer);
    }

    handleNext() {
        this.fadeText = true;
        setTimeout(() => {
            const len = this.images.length;
            this.currentIndex = (this.currentIndex + 1) % len;
            this.fadeText = false;
        }, 120);
    }

    handlePrev() {
        this.fadeText = true;
        setTimeout(() => {
            const len = this.images.length;
            this.currentIndex = (this.currentIndex - 1 + len) % len;
            this.fadeText = false;
        }, 120);
    }

    /* desc- use to get the id's of content and store in images  */
    get images() {
        return [
            this.cmsImage1,
            this.cmsImage2,
            this.cmsImage3

        ].filter(img => !!img);
    }

    /* desc- use to current img url and get the image url from images array based on index */
    get currentImage() {
        const imageUrl = this.images[this.currentIndex];
        // Only return a valid image URL if imageUrl is defined
        return imageUrl ? `${this.baseUrl}${imageUrl}` : '';
    }

    get slotNames() {
        return this.images.map((_, idx) => ({
            heading: `bannerHeading${idx + 1}`,
            button: `bannerButton${idx + 1}`,
            isCurrent: this.currentIndex === idx
        }));
    }

    get isFirstImage() {
        return this.currentIndex === 0;
    }
    get isSecondImage() {
        return this.currentIndex === 1;
    }
    get isThirdImage() {
        return this.currentIndex === 2;
    }

    get showArrows() {
        const result = this.images.length > 1;
        console.log('Show arrows?', result, 'Images count:', this.images.length);
        return result;
    }

    get textContainerClass() {
        return this.fadeText ? 'text-container fade' : 'text-container';
    }
    get isLeftDisabled() {
        return this.currentIndex === 0;
    }

    get isRightDisabled() {
        return this.currentIndex === this.images.length - 1;
    }
    get imageSize(){
        return `carousel-image ${this.imageAlignment === 'Scale to fit' ? 'contain' : 'cover'}`;
    }
    get paddingValue() {
        switch (this.padding) {
            case 'Small':
                return '10';
            case 'Medium':
                return '20';
            case 'Large':
                return '40';
            case 'None':
                return '0'; 
             default:
            return '0';
        }
    }

    /* Banner container style */
    get bannerStyle() {
        return `
            min-height: ${this.minHeight}px;
            width: ${this.bannerWidth}%;
            margin: auto;
            background-color: ${this.backgroundColor};
            text-align: ${this.horizontalAlign};
            padding: ${this.paddingValue}px;
            border: ${this.borderWeight}px solid ${this.borderColor};
            border-radius: ${this.borderRadius}px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: ${this.horizontalAlign};
        `;
    }

    /* Image style */
    get imageStyle() {
        return `
            width: 100%;
            height: auto;
            object-fit: ${this.imageAlignment === 'Stretch to fit' ? 'fill' : 'contain'};
            border-radius: ${this.borderRadius}px;
        `;
    }
}