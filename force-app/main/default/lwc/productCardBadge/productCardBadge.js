import { LightningElement, api } from 'lwc';

export default class ProductCardBadge extends LightningElement {
    @api badges = []; // Array of strings e.g. ['Best Seller', 'Trending']

    get badgeLabel() {
        if (!this.badges || this.badges.length === 0) return null;
        
        // Priority Logic: Out of Stock > Best Seller > Trending
        if (this.badges.includes('Out of Stock')) return 'Out Of Stock';
        if (this.badges.includes('Best Seller')) return 'Best Seller';
        if (this.badges.includes('Trending')) return 'Trending';
        
        return this.badges[0]; // Fallback to first badge
    }

    get badgeClass() {
        let base = 'badge ';
        const label = this.badgeLabel;
        
        if (label === 'Out Of Stock') return base + 'badge-stock';
        if (label === 'Best Seller') return base + 'badge-seller';
        if (label === 'Trending') return base + 'badge-trending';
        
        return base;
    }

    get isTrending() {
        return this.badgeLabel === 'Trending';
    }
}
