import { LightningElement, api, wire } from 'lwc';
import { getNavigationMenu } from 'experience/navigationMenuApi';
import { publish, MessageContext } from 'lightning/messageService';
import B2BDemoStoreChannel from '@salesforce/messageChannel/B2BDemoStore__c';
import { NavigationMixin } from 'lightning/navigation';
import basePath from '@salesforce/community/basePath';

/**
 * Navigation actions component for the global header.
 * Renders a primary navigation entry that can either navigate directly
 * or show a dropdown with additional links, with mobile-aware behavior.
 */
export default class NavigationActions extends NavigationMixin(LightningElement) {
  /** Developer name of the Experience Cloud navigation menu to load. */
  @api navigationDeveloperName;
  /** CMS image ID for the white down arrow icon. */
  @api downArrowImageWhite;
  /** CMS image ID for the right arrow icon. */
  @api imageArrowRight;

  /** Whether the viewport is considered mobile (<= 768px). */
  isMobile = false;

  /** Navigation menu items loaded from the navigation API. */
  menuItems = [];

  /** Lightning Message Service context used to publish flyout close events. */
  @wire(MessageContext) messageContext;

  /** Load navigation menu items for the configured navigationDeveloperName. */
  @wire(getNavigationMenu, {
      navigationLinkSetDeveloperName: '$navigationDeveloperName'
  })
  wiredMenu({ data, error }) {
    if (data) {
      this.menuItems = data.menuItems;
    } else if (error) {
      console.error(error);
    }
  }

  /** Fully qualified URL for the right arrow icon image. */
  get arrowImagetoShow() {
    return this.imageArrowRight
      ? `${basePath}/sfsites/c/cms/delivery/media/${this.imageArrowRight}`
      : null;
  }

  /** Fully qualified URL for the white down arrow icon image. */
  get downArrowImageToShow() {
    return this.downArrowImageWhite
      ? `${basePath}/sfsites/c/cms/delivery/media/${this.downArrowImageWhite}`
      : null;
  }

  /** First menu item, if any. */
  get firstItem() {
    return this.menuItems?.length ? this.menuItems[0] : null;
  }

  /** True when there is exactly one menu item. */
  get hasSingleItem() {
    return this.menuItems.length === 1;
  }

  /** True when there are multiple menu items. */
  get hasMultipleItems() {
    return this.menuItems.length > 1;
  }

  /** Initialize viewport detection and resize listener. */
  connectedCallback() {
    this.checkViewport();
    window.addEventListener('resize', this.checkViewport.bind(this));
  }

  /** Cleanup resize listener when component is destroyed. */
  disconnectedCallback() {
    window.removeEventListener('resize', this.checkViewport.bind(this));
  }

  /** Determine if the current viewport width is mobile. */
  checkViewport() {
    this.isMobile = window.innerWidth <= 768;
  }

  /** Whether the dropdown menu is currently visible. */
  showDropdown = false;

  /**
   * Toggle the dropdown; if only one item exists, navigate directly instead.
   */
  toggleDropdown() {
    // If only one item → redirect
    if (this.menuItems.length === 1) {
      this.closeFlyout();
      this.redirect(this.firstItem.actionValue);
      return;
    }

    // Else toggle dropdown
    this.showDropdown = !this.showDropdown;
  }

  /** Handle navigation from a menu item on mobile. */
  mobileNavigate(event) {
    const link = event.currentTarget?.dataset?.url;
    if (link) {
      this.closeFlyout();
      this.redirect(link);
    }
  }

  /** Publish a message to close any global flyout menus. */
  closeFlyout() {
    const payload = {
      globalFlyoutClosing: 'close'
    };

    publish(this.messageContext, B2BDemoStoreChannel, payload);
  }

  /** Navigate to a web page derived from the menu item URL. */
  redirect(url) {
    const pageName = this.getRecordIdFromUrl(url);
    console.log('pageName', pageName);

    this[NavigationMixin.Navigate]({
      type: 'standard__webPage',
      attributes: {
        url: `/${pageName}`
      }
    });
  }

  /** Extract the last path segment from a URL. */
  getRecordIdFromUrl(url) {
    const path = url;
    const parts = path.split('/');
    return parts[parts.length - 1]; // last segment
  }
}