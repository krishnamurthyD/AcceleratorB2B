import { LightningElement, api } from "lwc";
import { getFlagEmoji, getLocaleLabel, getFlagUrl } from "./util";
export default class CommonCountryPickerGrid extends LightningElement {
  static renderMode = "light";
  @api
  locales;
  get formattedLocales() {
    const activeLanguagesSet = (this.locales ?? []).map((locale) => ({
      ...locale,
      flag: getFlagEmoji(locale.countryCode),
      flagUrl: getFlagUrl(locale.countryCode),
      localeLabel: getLocaleLabel(locale.languageLabel, locale.countryCode)
    }));
    return activeLanguagesSet;
  }
  handleLocaleClick(e) {
    const locale = e.currentTarget?.dataset.locale;
    this.dispatchEvent(
      new CustomEvent("localechange", {
        bubbles: true,
        composed: true,
        detail: locale
      })
    );
  }
}
