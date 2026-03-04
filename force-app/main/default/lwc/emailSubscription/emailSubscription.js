import { LightningElement, api } from 'lwc';
import checkDuplicateEmail from '@salesforce/apex/NewsletterController.checkDuplicateEmail';

// Custom Labels
import EMAIL_ALREADY_SUB from '@salesforce/label/c.Email_already_subscribed';
import INVALID_EMAIL from '@salesforce/label/c.Please_enter_a_valid_email_address';
import GENERIC_ERROR from '@salesforce/label/c.Something_went_wrong';
import EMAIL_SUBSCRIBED from '@salesforce/label/c.Email_Subscribed';


export default class EmailSubscription extends LightningElement {
    email = '';
    errorMessage = '';
    showSuccess = false;
    showErrorBorder = false;

    @api checkDuplicate;

    handleChange(event) {
        this.email = event.target.value;
        this.errorMessage = '';
        this.showErrorBorder = false;
        this.showSuccess = false;
    }

    async handleSubscribe() {
        // Email validation
        const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

        if (!regex.test(this.email)) {
            this.errorMessage = INVALID_EMAIL;
            this.showErrorBorder = true;
            return;
        }

        try {
            // Call Apex Method
            const isDuplicate = await checkDuplicateEmail({
                email: this.email,
                checkDuplicate: this.checkDuplicate
            });

            if (isDuplicate) {
                this.errorMessage = EMAIL_ALREADY_SUB;
                this.showErrorBorder = true;
                return;
            }

            // Success
            this.showSuccess = true;
            this.errorMessage = '';
            this.showErrorBorder = false;
            this.successMessage = EMAIL_SUBSCRIBED;
            this.email = ''; 

        } catch (error) {
            console.error('Apex Error:', JSON.stringify(error));
            this.errorMessage = GENERIC_ERROR;
            this.showErrorBorder = true;
        }
    }

    // CSS Binding
    get inputClass() {
        return this.showErrorBorder ? 'email-input error' : 'email-input';
    }

    get subButton() {
        return this.showErrorBorder ? 'sub-button error' : 'subscribe-btn';
    }
}