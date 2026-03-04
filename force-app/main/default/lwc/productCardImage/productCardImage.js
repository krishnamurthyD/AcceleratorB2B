import { LightningElement, api, track } from 'lwc';

export default class ProductCardImage extends LightningElement {
    @api images = []; // List of image URLs
    @api altText = 'Product Image';

    @track currentImageIndex = 0;

    get currentImage() {
        if (this.images && this.images.length > 0) {
            return this.images[this.currentImageIndex];
        }
        return ''; // Fallback or placeholder
    }

    get hasMultipleImages() {
        return this.images && this.images.length > 1;
    }

    get leftArrowClass() {
        return this.currentImageIndex === 0 ? 'nav-arrow left disabled' : 'nav-arrow left';
    }

    get rightArrowClass() {
        return this.currentImageIndex === (this.images.length - 1) ? 'nav-arrow right disabled' : 'nav-arrow right';
    }

    handleNextImage(event) {
        event.stopPropagation();
        if (this.currentImageIndex < this.images.length - 1) {
            this.currentImageIndex++;
        }
    }

    handlePrevImage(event) {
        event.stopPropagation();
        if (this.currentImageIndex > 0) {
            this.currentImageIndex--;
        }
    }

    handleImageClick(event) {
        event.stopPropagation();
        this.dispatchEvent(new CustomEvent('imageclick'));
    }
}
