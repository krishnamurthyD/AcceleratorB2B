import { LightningElement, api } from 'lwc';
import checkDuplicateEmail from '@salesforce/apex/NewsletterController.checkDuplicateEmail';

export default class FooterEmailComponent extends LightningElement {

    @api checkDuplicate
    email = '';
    errorMessage = '';
    showSuccess = false;
    showErrorBorder = false;

    handleChange(event) {
        this.email = event.target.value;
        this.errorMessage = '';
        this.showErrorBorder = false;
    }

    handleSubscribe() {
        const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

        if (!regex.test(this.email)) {
            this.errorMessage = 'Please enter a valid email address.';
            this.showErrorBorder = true;
            this.showSuccess = false;
        } 

        checkDuplicateEmail({ email: this.email, checkDuplicate: this.checkDuplicate })
            .then(result => {
                if (result) {
                    this.errorMessage = 'Email already subscribed!';
                    this.showErrorBorder = true;
                } else {
                    this.showSuccess = true;
                    console.log('Subscribed successfully:', this.email);
                }
            })
            .catch(error => {
                this.errorMessage = 'Something went wrong. Please try again.';
                console.error('Error: ', error);
            });
        // else {
        //     this.errorMessage = '';
        //     this.showErrorBorder = false;
        //     this.showSuccess = true;

        //     console.log('Subscribed with email:', this.email);

        //     checkDuplicateEmail({ email: this.email, checkDuplicate: this.checkDuplicate })
        //         .then(() => {
        //             this.showSuccess = true;

        //             setTimeout(() => {
        //                 this.showSuccess = false;
        //             }, 3000);
        //         })
        //         .catch(error => {
        //             this.errorMessage = 'Something went wrong. Please try again.';
        //             console.error(error);
        //         });
        // }
    }
}