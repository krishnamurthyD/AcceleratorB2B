import { LightningElement, api, wire } from 'lwc';
import { CurrentPageReference, NavigationContext, generateUrl } from 'lightning/navigation';
import { CartAdapter, cartDelete } from 'commerce/checkoutCartApi';
import { generateLocales, getLanguageLabel } from './generateLocalesUtil';
import activeLanguages from '@salesforce/site/activeLanguages';
import currentSiteLanguage from '@salesforce/i18n/lang';
import basePath from '@salesforce/community/basePath';
import { changeLocale } from './utils';
import { languageCodeToCountry } from './fallbackCountries';
export default class CountryPickerV2 extends LightningElement {
  static renderMode = 'light';
  @api
  sort;
  @api
  languageDisplayType;
  @api
  countryTextColor;
  @api
  countryHoverTextColor;
  @api
  countryTextAlignment;
  @api
  backgroundColor;
  @api
  pickerButtonAlignment;
  @api
  pickerButtonStyle;
  @api
  pickerButtonSize;
  @api
  pickerButtonLabelText;
  @api
  headingLabelText;
  @api
  showGlobeIcon = false;
  @api
  markets = [];
  @api
  languages;
  @api
  countries;
  @api
  icon;
  @wire(CurrentPageReference)
  currentPageReference;
  @wire(NavigationContext)
  navContext;
  @wire(CartAdapter)
  cart;
  get iconToShow() {
    return this.icon;
  }
  get locales() {
    const locals = generateLocales(this?.markets ?? [], this.languages, this.languageDisplayType, this.countries);    
    return locals;
  }
  get totalProductCount() {
    const totalProductCount = parseInt(this.cart?.data?.cartSummary?.totalProductCount ?? '0', 10);
    return Number.isNaN(totalProductCount) ? 0 : totalProductCount;
  }
  get pickerButtonLanguage() {
    const [languageCode, countryCode] = this._currentLanguageSplit();
    return getLanguageLabel(languageCode, this.languageDisplayType, this.languages, countryCode);
  }
  get pickerButtonCountry() {
    const [languageCode, countryCode] = this._currentLanguageSplit();
    return countryCode || (!countryCode && languageCode ? languageCodeToCountry.languageCode[languageCode] : null);
  }
  _currentLanguageSplit() {
    return currentSiteLanguage.indexOf('_') > -1 ? currentSiteLanguage.split('_') : currentSiteLanguage.split('-');
  }
  async handleLocaleChange(e) {
    try {
      await cartDelete();
    } catch (error) {
      console.warn(error);
    }
    let response = '';
    if (this.navContext && this.currentPageReference) {
      response = generateUrl(this.navContext, this.currentPageReference);
    }
    const currentSiteLanguageIsDefault = Boolean(activeLanguages.find(lang => lang.code === currentSiteLanguage)?.default);
    let effectiveBasePath = basePath;
    if (!effectiveBasePath.endsWith(`/${currentSiteLanguage}`) && !currentSiteLanguageIsDefault) {
      effectiveBasePath += `/${currentSiteLanguage}`;
    }
    changeLocale(response, effectiveBasePath, currentSiteLanguage, e.detail);
  }
}