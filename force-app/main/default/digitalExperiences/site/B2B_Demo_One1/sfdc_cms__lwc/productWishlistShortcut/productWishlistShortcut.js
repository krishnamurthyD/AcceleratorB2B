import { api, LightningElement, wire } from 'lwc';
import { generateUrl, navigate, NavigationContext } from 'lightning/navigation';
import { generateStyleProperties } from 'experience/styling';

const WISHLIST_PAGE_REF = {
  type: 'comm__namedPage',
  attributes: {
    name: 'Wishlist'
  }
};

const LOG_IN_PAGE_REF = {
  type: 'comm__namedPage',
  attributes: {
    name: 'Login'
  }
};
export default class ProductWishlistShortcut extends LightningElement {
  @api 
  isGuestUser;
  static renderMode = 'light';
  @wire(NavigationContext)
  navContext;
  @api
  iconType;
  @api
  iconLinkColor;
  @api
  iconLinkHoverColor;
  @api
  isOutlined;
  get customStyles() {
    return generateStyleProperties([{
      name: '--com-c-wishlist-shortcut-color',
      value: this.iconLinkColor
    }, {
      name: '--com-c-wishlist-shortcut-color-hover',
      value: this.iconLinkHoverColor
    }]);
  }
  get iconUrl() {
    return this.navContext ? generateUrl(this.navContext, WISHLIST_PAGE_REF) : undefined;
  }
  handleWishlistIconClick() {
    if (this.isGuestUser === 'true') {
      this.navContext && navigate(this.navContext, LOG_IN_PAGE_REF);
    }else {
      this.navContext && navigate(this.navContext, WISHLIST_PAGE_REF);
    }
  }
}