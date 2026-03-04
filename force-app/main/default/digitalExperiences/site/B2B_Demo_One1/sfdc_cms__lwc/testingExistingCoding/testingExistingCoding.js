import { LightningElement, api } from 'lwc';

export default class TestingExistingCoding extends LightningElement {
    // Cart count / type
    @api showCount;
    @api countType;

    // Mini cart main switches
    @api showMiniCartProperties;
    @api showMiniCart;

    // Text + sizes
    @api headerText;
    @api checkoutButtonText;
    @api checkoutButtonSize;
    @api showContinueShoppingButton;
    @api continueShoppingButtonText;
    @api continueShoppingButtonSize;
    @api showExpressCheckoutButton;

    // Payments
    @api useManualCapture;
    @api paymentMethodSetId;

    // View cart button
    @api showViewCartButton;
    @api viewCartButtonText;
    @api viewCartButtonSize;

    // Recommendations
    @api showRecommendation;
    @api recommendationHeaderText;
    @api recommendationPriceDisplayType;

    // Helpers (optional, for your template logic)
    get showHeader() {
        return this.showMiniCart;
    }

    get hasCount() {
        return this.showCount;
    }
}