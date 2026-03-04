import { LightningElement, api } from 'lwc';

export default class ProductCardActions extends LightningElement {
    @api isWishlisted = false;
    @api isOutOfStock = false;

    get wishlistIconName() {
        return this.isWishlisted ? 'utility:favorite' : 'utility:favorite_alt';
    }

    get wishlistIconClass() {
        return this.isWishlisted ? 'wishlist-icon active' : 'wishlist-icon';
    }

    handleWishlistClick(event) {
        event.stopPropagation();
        this.dispatchEvent(new CustomEvent('wishlisttoggle'));
    }

    handleQuickView(event) {
        event.stopPropagation();
        this.dispatchEvent(new CustomEvent('quickview'));
    }

    handleViewSimilar(event) {
        event.stopPropagation();
        this.dispatchEvent(new CustomEvent('viewsimilar'));
    }

    handleNotifyMe(event) {
        event.stopPropagation();
        this.dispatchEvent(new CustomEvent('notifyme'));
    }
}
