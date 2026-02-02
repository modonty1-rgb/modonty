export interface LicenseOption {
  value: string;
  label: string;
  url?: string;
}

export const LICENSE_OPTIONS: LicenseOption[] = [
  { value: 'none', label: 'None' },
  { value: 'CC BY', label: 'CC BY - Attribution', url: 'https://creativecommons.org/licenses/by/4.0/' },
  { value: 'CC BY-SA', label: 'CC BY-SA - Attribution-ShareAlike', url: 'https://creativecommons.org/licenses/by-sa/4.0/' },
  { value: 'CC BY-NC', label: 'CC BY-NC - Attribution-NonCommercial', url: 'https://creativecommons.org/licenses/by-nc/4.0/' },
  { value: 'CC BY-ND', label: 'CC BY-ND - Attribution-NoDerivs', url: 'https://creativecommons.org/licenses/by-nd/4.0/' },
  { value: 'CC BY-NC-SA', label: 'CC BY-NC-SA - Attribution-NonCommercial-ShareAlike', url: 'https://creativecommons.org/licenses/by-nc-sa/4.0/' },
  { value: 'CC BY-NC-ND', label: 'CC BY-NC-ND - Attribution-NonCommercial-NoDerivs', url: 'https://creativecommons.org/licenses/by-nc-nd/4.0/' },
  { value: 'CC0', label: 'CC0 - Public Domain Dedication', url: 'https://creativecommons.org/publicdomain/zero/1.0/' },
  { value: 'All Rights Reserved', label: 'All Rights Reserved' },
];
