import { LightningElement, api } from 'lwc';

export default class ProductCardInfo extends LightningElement {
    @api name;
    @api partNumber;
    @api rating;
    @api reviewCount;
    @api variantCount;

    handleNavigate(event) {
        event.preventDefault();
        event.stopPropagation();
        this.dispatchEvent(new CustomEvent('navigate'));
    }
}
