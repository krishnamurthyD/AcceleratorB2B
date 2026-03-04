import { UserProfileMenuAltLabel, UserProfileWithCompanyNameAltLabel } from './labels';
export default function userProfileMenuAltLabelGenerator(userName, companyName) {
  const safeUserName = userName == null ? '' : String(userName);
  const safeCompanyName = companyName == null ? '' : String(companyName);

  const baseAlt = UserProfileMenuAltLabel == null ? '' : String(UserProfileMenuAltLabel);
  const baseAltWithCompany = UserProfileWithCompanyNameAltLabel == null ? baseAlt : String(UserProfileWithCompanyNameAltLabel);

  if (safeCompanyName) {
    return baseAltWithCompany
      .replace('{userName}', safeUserName)
      .replace('{companyName}', safeCompanyName);
  }

  return baseAlt.replace('{userName}', safeUserName);
}