import { LightningElement, api } from 'lwc';

export default class PlpBanner extends LightningElement {
    @api title = 'Special Offer';
    @api subtitle = 'Get 20% off on selected items';
    @api ctaLabel = 'Shop Now';
    @api imageSrc;

    handleClick() {
        // Dispatch event or navigate
        console.log('Banner clicked');
    }
}