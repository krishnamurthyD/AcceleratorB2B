import { LightningElement, api } from 'lwc';
import BasePath from '@salesforce/community/basePath';
import {getFlagEmoji, getFlagUrl} from './util';
import { generateButtonVariantClass, generateButtonIconSize } from 'experience/styling';
const EVENT_OPEN_COUNTRY_PICKER = 'opencountrypicker';
export default class CommonCountryPickerButton extends LightningElement {
  static renderMode = 'light';
  @api
  variant;
  @api
  alignment;
  @api
  size;
  @api
  buttonLabel;
  @api
  disabled = false;
  @api
  buttonLang;
  @api
  buttonCountry;
  @api
  showGlobeIcon = false;
  @api 
  iconShow;

  get iconToShow() {
    return `${BasePath}/sfsites/c/cms/delivery/media/${this.iconShow}`
  } 
  get iconPath() {
    return `${BasePath}/assets/images/globe-icon.svg#globe-icon`;
  }
  @api
  focusButton() {
    this.querySelector('button')?.focus();
  }
  get flagUrl() {
    return getFlagUrl(this.buttonCountry);
  }
  get buttonLabelText() {
    return `${this.buttonCountry?.toUpperCase()} `
  }
  get customIconClasses() {
    const classes = [generateButtonVariantClass(this.variant ?? null)];
    this.disabled ? classes.push('site-common-country-picker-button-icon-disabled') : classes.push('site-common-country-picker-button-icon');
    return classes;
  }
  get alignmentClasses() {
    return 'site-common-country-picker-button-alignment';
  }
  get customPickerClasses() {
    const classes = ['site-common-country-picker-button'];
    if (!this.disabled) {
      this.variant === 'primary' ? classes.push('site-common-country-picker-ui-primary-icon-color') : classes.push('site-common-country-picker-ui-icon-color');
    }
    return classes;
  }
  get customIconSize() {
    return generateButtonIconSize(this.size ?? 'small');
  }
  handleClick() {
    const openCountryPicker = new CustomEvent(EVENT_OPEN_COUNTRY_PICKER);
    this.dispatchEvent(openCountryPicker);
  }
}