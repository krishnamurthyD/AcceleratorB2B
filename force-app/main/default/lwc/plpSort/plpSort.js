import { LightningElement, api } from 'lwc';

export default class PlpSort extends LightningElement {
    @api options = [];
    @api value;

    get computedValue() {
        // If value is provided and valid, use it
        if (this.value) {
            return this.value;
        }
        // Otherwise, fallback to the first option if available
        if (this.options && this.options.length > 0) {
            return this.options[0].value;
        }
        return undefined;
    }

    handleSortChange(event) {
        this.dispatchEvent(new CustomEvent('sortchange', {
            detail: { value: event.detail.value }
        }));
    }
}