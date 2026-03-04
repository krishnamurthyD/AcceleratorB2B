/**
 * Author:        Krishnamurthy Donta
 * Created Date:  Nov 11, 2025
 * Description:   Global Header LWC Component with responsive design
 * Version:       1.0
 */

import { LightningElement, track, api, wire } from "lwc";
import { subscribe, MessageContext } from "lightning/messageService";
import B2BDemoStoreChannel from "@salesforce/messageChannel/B2BDemoStore__c";

/**
 * Global header component used across the storefront.
 * Provides a responsive desktop/mobile header with slots for logo,
 * navigation, actions, and integrates with a global flyout close channel.
 */
/**
 * @slot Site-Logo                     - Header logo (also used on desktop)
 * @slot MultiLevel-Navigation         - Navigation links; inline on desktop, drawer body on mobile
 * @slot Action                        - Optional action content shown in drawer body on mobile
 * @slot Country-Selector              - Country/locale selector (hidden on mobile top bar)
 * @slot Search-Bar                    - Search input/icon (hidden on mobile top bar)
 * @slot Heart-Icon                    - Wishlist icon (visible on mobile top bar)
 * @slot Cart-Icon                     - Cart icon (visible on mobile top bar)
 * @slot User-Menu                     - User profile menu (hidden on mobile top bar)
 * @slot drawer-MultiLevel-Navigation  - Navigation links rendered in mobile drawer body
 * Drawer header specific slots (optional; to avoid duplicate slot names):
 * @slot Drawer-Logo                   - Logo shown inside drawer header
 * @slot Drawer-Action                 - Action content inside drawer header
 * @slot Drawer-Country-Selector       - Country selector inside drawer header
 * @slot Drawer-Country-Selector-one   - Alternate country selector inside drawer header
 * @slot Drawer-User-Menu              - User menu (login/avatar) inside drawer header
 * @slot Drawer-Logo-Body              - Optional logo shown in drawer body above nav
 */
export default class GlobalHeader extends LightningElement {
  /** Backing field to ensure proper boolean coercion from attribute strings. */
  _showActionSlot = false;
  /** Indicates if mobile layout is forced via Experience Builder property. */
  _isMobilePhone = false;

  /** Tracks whether the viewport is considered mobile (<= 768px). */
  @track isViewportMobile = false;

  /**
   * Whether the header should use the mobile layout.
   * True if the property is set or viewport is mobile.
   */
  @api
  get isMobilePhone() {
    return this._isMobilePhone || this.isViewportMobile;
  }
  set isMobilePhone(value) {
    this._isMobilePhone = this.normalizeBoolean(value);
  }

  /** Controls whether the optional drawer Action slot is rendered. */
  @api
  get showActionSlot() {
    return this._showActionSlot;
  }
  set showActionSlot(value) {
    this._showActionSlot = this.normalizeBoolean(value);
  }

  /** Whether the mobile menu drawer is currently open. */
  @track isMenuOpen = false;

  /** Subscription reference for the global flyout message channel. */
  subscription = null;

  /** Lightning Message Service context used to subscribe to close events. */
  @wire(MessageContext) messageContext;

  /** Subscribe to the global flyout close channel once. */
  subscribeChannel() {
    if (this.subscription) {
      return;
    }

    this.subscription = subscribe(
      this.messageContext,
      B2BDemoStoreChannel,
      (message) => {
        this.handleMessage(message);
      }
    );
  }

  /** Handle messages from B2BDemoStoreChannel and close menu when requested. */
  handleMessage(message) {
    if (message?.globalFlyoutClosing === "close") {
      this.closeMenu();
    }
  }

  /**
   * Toggle mobile menu open/close
   */
  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
    this.toggleBodyScroll();
  }

  /**
   * Close mobile menu
   */
  closeMenu() {
    this.isMenuOpen = false;
    this.enableBodyScroll();
  }

  /**
   * Disable/enable body scroll when menu is open
   */
  toggleBodyScroll() {
    if (this.isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }

  /**
   * Enable body scroll
   */
  enableBodyScroll() {
    document.body.style.overflow = "";
  }

  /** Lifecycle: track viewport <= 768px and update reactivity. */
  connectedCallback() {
    this.subscribeChannel();
    // Initialize viewport flag
    this.isViewportMobile =
      typeof window !== "undefined" ? window.innerWidth <= 768 : false;
    // Bind and listen for resize to keep template reactive
    this._onResize = () => {
      const next = window.innerWidth <= 768;
      if (this.isViewportMobile !== next) {
        this.isViewportMobile = next;
      }
    };
    window.addEventListener("resize", this._onResize);
  }

  /**
   * Computed class for hamburger icon animation
   */
  get hamburgerIconClass() {
    return this.isMenuOpen ? "hamburger-icon open" : "hamburger-icon";
  }

  /**
   * Computed class for mobile menu
   */
  get mobileMenuClass() {
    return this.isMenuOpen ? "mobile-menu open" : "mobile-menu";
  }

  /**
   * Computed class for menu overlay
   */
  get menuOverlayClass() {
    return this.isMenuOpen ? "menu-overlay show" : "menu-overlay";
  }

  /** Expose showActionSlot backing value to the template. */
  get showHideActionSlot() {
    return this._showActionSlot;
  }

  /**
   * Root class toggles a 'force-mobile' flag so Builder can see drawer header slots
   * even on wide screens when the isMobilePhone property is enabled.
   */
  get rootClass() {
    return this.isMobilePhone ? "global-header force-mobile" : "global-header";
  }

  /**
   * Cleanup on component disconnect
   */
  disconnectedCallback() {
    this.enableBodyScroll();
    if (this._onResize) {
      window.removeEventListener("resize", this._onResize);
    }
  }

  /**
   * Utility: normalize any attribute value ("true"/"false"/boolean/null/undefined)
   * into a real boolean the template can rely on reliably.
   */
  normalizeBoolean(val) {
    if (val === true || val === false) return val;
    if (val === null || val === undefined) return false;
    // String inputs from markup
    const str = String(val).trim().toLowerCase();
    if (
      str === "false" ||
      str === "0" ||
      str === "no" ||
      str === "off" ||
      str === ""
    ) {
      return false;
    }
    return true;
  }
}