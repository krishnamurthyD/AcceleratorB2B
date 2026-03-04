import { LightningElement, api } from 'lwc';

export default class ProductCardPricing extends LightningElement {
    @api salesPrice;
    @api listPrice;
    @api discountText;
    @api urgencyMessage;

    get urgencyClass() {
        if (!this.urgencyMessage) return '';
        
        // Requirement: All PLP messages should be red
        return 'urgency-text red';
    }
}
