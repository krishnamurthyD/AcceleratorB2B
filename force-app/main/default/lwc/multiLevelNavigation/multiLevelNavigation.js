import { LightningElement, track, wire, api } from "lwc";
import { getNavigationMenu } from "experience/navigationMenuApi";
import basePath from "@salesforce/community/basePath";
import { publish, MessageContext } from "lightning/messageService";
import B2BDemoStoreChannel from "@salesforce/messageChannel/B2BDemoStore__c";
import { NavigationMixin } from "lightning/navigation";

/**
 * Multi-level navigation menu for the global header.
 * Supports desktop hover menus and mobile accordion-style navigation.
 */
export default class MultiLevelNavigation extends NavigationMixin(
  LightningElement
) {
  /** CMS image ID for the right arrow icon. */
  @api imageArrowRight;
  /** CMS image ID for the white down arrow icon. */
  @api downArrowImageWhite;
  /** Maximum depth of navigation levels to render. */
  @api maxLevels = 5;

  /** Root level (L1) menu items. */
  @track menu = [];
  /** Level 2 submenu items for the current L1 selection. */
  @track level2 = [];
  /** Level 3 submenu items for the current L2 selection. */
  @track level3 = [];
  /** Level 4 submenu items for the current L3 selection. */
  @track level4 = [];

  /** Visibility flags for desktop flyout levels. */
  @track showLevel2 = false;
  @track showLevel3 = false;
  @track showLevel4 = false;

  /** Whether the viewport is considered mobile (<= 768px). */
  @track isMobile = false;

  /** Lightning Message Service context used to publish flyout close events. */
  @wire(MessageContext) messageContext;

  /** Load navigation menu items from Experience Cloud navigation. */
  @wire(getNavigationMenu, { publishStatus: "Live" })
  wiredMenu({ data, error }) {
    if (data) {
      this.menu = this.limitDepth(data.menuItems, 1, this.maxLevels);
    } else if (error) {
      console.error("NAV ERROR =>", error);
    }
  }

  /**
   * Fully qualified URL for the right arrow icon image.
   */
  get arrowImagetoShow() {
    return this.imageArrowRight
      ? `${basePath}/sfsites/c/cms/delivery/media/${this.imageArrowRight}`
      : null;
  }

  /**
   * Fully qualified URL for the white down arrow icon image.
   */
  get downArrowImageToShow() {
    return this.downArrowImageWhite
      ? `${basePath}/sfsites/c/cms/delivery/media/${this.downArrowImageWhite}`
      : null;
  }

  /** Initialize mobile detection and register resize listener. */
  connectedCallback() {
    this.detectMobile();
    window.addEventListener("resize", () => this.detectMobile());
  }

  /** Determine if the current viewport width is mobile. */
  detectMobile() {
    this.isMobile = window.innerWidth <= 768;
  }

  /**
   * Limit navigation tree depth dynamically based on maxLevels.
   */
  limitDepth(nodes, depth, maxDepth) {
    if (!nodes || depth >= maxDepth) {
      return [];
    }
    return nodes.map((n) => ({
      ...n,
      subMenu: this.limitDepth(n.subMenu, depth + 1, maxDepth)
    }));
  }

  /** Handle L1 (top-level) hover on desktop. */
  selectLevel1(event) {
    const index = event.currentTarget.dataset.index;
    this.level2 = this.menu[index].subMenu || [];
    this.level3 = [];
    this.level4 = [];
    this.showLevel2 = true;
    this.showLevel3 = false;
    this.showLevel4 = false;
  }

  /** Handle L2 hover on desktop. */
  selectLevel2(event) {
    const index = event.currentTarget.dataset.index;
    this.level3 = this.level2[index].subMenu || [];
    this.level4 = [];
    this.showLevel3 = true;
    this.showLevel4 = false;
  }

  /** Handle L3 hover on desktop. */
  selectLevel3(event) {
    const index = event.currentTarget.dataset.index;
    this.level4 = this.level3[index].subMenu || [];
    this.showLevel4 = true;
  }

  /** Hide all desktop flyout levels. */
  hideMenu() {
    this.showLevel2 = false;
    this.showLevel3 = false;
    this.showLevel4 = false;
  }

  /**
   * Generic mobile click handler (reserved for future use).
   * Currently closes the flyout and redirects when an action value is present.
   */
  mobileClickHandler(event) {
    const actionValue = event.currentTarget?.dataset.set;
    if (actionValue) {
      this.closeFlyout();
      this.redirect(actionValue);
    }
  }

  // ---------- MOBILE L1 ----------
  /** Toggle or navigate from a level 1 item in mobile view. */
  selectMobileL1(event) {
    const index = event.currentTarget.dataset.index;
    const link = event.currentTarget.dataset.link;

    this.menu = this.menu.map((item, i) => ({
      ...item,
      isOpen: i == index ? !item.isOpen : false
    }));

    // Navigate if no children
    if (!this.menu[index].subMenu.length) {
      this.closeFlyout();
      this.redirect(link);
    }
  }

  // ---------- MOBILE L2 ----------
  /** Toggle or navigate from a level 2 item in mobile view. */
  selectMobileL2(event) {
    const p = event.currentTarget.dataset.parent;
    const index = event.currentTarget.dataset.index;
    const link = event.currentTarget.dataset.link;

    const l2 = this.menu[p].subMenu;

    this.menu[p].subMenu = l2.map((item, i) => ({
      ...item,
      isOpen: i == index ? !item.isOpen : false
    }));

    // Force reactivity
    this.menu = [...this.menu];

    if (!l2[index].subMenu.length) {
      this.closeFlyout();
      this.redirect(link);
    }
  }

  // ---------- MOBILE L3 ----------
  /** Toggle or navigate from a level 3 item in mobile view. */
  selectMobileL3(event) {
    const p1 = event.currentTarget.dataset.parent;
    const p2 = event.currentTarget.dataset.parent2;
    const index = event.currentTarget.dataset.index;
    const link = event.currentTarget.dataset.link;

    const l3 = this.menu[p1].subMenu[p2].subMenu;

    this.menu[p1].subMenu[p2].subMenu = l3.map((item, i) => ({
      ...item,
      isOpen: i == index ? !item.isOpen : false
    }));

    this.menu = [...this.menu];

    if (!l3[index].subMenu.length) {
      // window.location.href = link;
      this.closeFlyout();
      this.redirect(link);
    }
  }

  /** Publish a message to close any global flyout menus. */
  closeFlyout() {
    const payload = {
      globalFlyoutClosing: "close"
    };

    publish(this.messageContext, B2BDemoStoreChannel, payload);
  }

  /** Navigate to a ProductCategory record using a URL from the menu item. */
  redirect(url) {
    const recordId = this.getRecordIdFromUrl(url);
    this[NavigationMixin.Navigate](
      {
        type: "standard__recordPage",
        attributes: {
          recordId: recordId,
          objectApiName: "ProductCategory",
          actionName: "view"
        }
      },
      true // Replace current page in browser history
    );
  }

  /** Extract the record Id from the tail of a URL path. */
  getRecordIdFromUrl(url) {
    const path = url;
    const parts = path.split("/");
    return parts[parts.length - 1]; // last segment
  }
}