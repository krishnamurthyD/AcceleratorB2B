import { LightningElement, api, track } from 'lwc';

export default class ProductCardCart extends LightningElement {
    @api isOutOfStock = false;
    @api maxQuantity = 10; // Default max

    @track quantity = 1;

    handleQtyPlus(event) {
        event.stopPropagation();
        if (this.quantity < this.maxQuantity) {
            this.quantity++;
        } else {
            this.dispatchEvent(new CustomEvent('maxlimitreached'));
        }
    }

    handleQtyMinus(event) {
        event.stopPropagation();
        if (this.quantity > 1) {
            this.quantity--;
        }
    }

    handleAddToCart(event) {
        event.stopPropagation();
        this.dispatchEvent(new CustomEvent('addtocart', {
            detail: { quantity: this.quantity }
        }));
    }

    handleNotifyMe(event) {
        event.stopPropagation();
        this.dispatchEvent(new CustomEvent('notifyme'));
    }
}
