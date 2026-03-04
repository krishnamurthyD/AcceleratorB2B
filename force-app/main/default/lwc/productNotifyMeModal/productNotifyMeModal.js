import { LightningElement, api, track } from 'lwc';

export default class ProductNotifyMeModal extends LightningElement {
    @api isOpen = false;
    @api productId;

    @track firstName = '';
    @track lastName = '';
    @track email = '';

    handleInputChange(event) {
        const field = event.target.name;
        if (field === 'firstName') this.firstName = event.target.value;
        if (field === 'lastName') this.lastName = event.target.value;
        if (field === 'email') this.email = event.target.value;
    }

    handleClose() {
        this.dispatchEvent(new CustomEvent('close'));
    }

    handleSubmit() {
        // Basic Validation
        if (!this.firstName || !this.lastName || !this.email) {
            // In a real app, show error. For now, just return or alert.
            // We can use reportValidity on inputs if we query them.
            const inputs = this.template.querySelectorAll('input');
            inputs.forEach(input => {
                if (!input.value) {
                    input.classList.add('slds-has-error');
                } else {
                    input.classList.remove('slds-has-error');
                }
            });
            return;
        }

        // Dispatch success event with data
        this.dispatchEvent(new CustomEvent('submit', {
            detail: {
                productId: this.productId,
                firstName: this.firstName,
                lastName: this.lastName,
                email: this.email
            }
        }));
        
        // Reset and close
        this.firstName = '';
        this.lastName = '';
        this.email = '';
        this.handleClose();
    }
}
