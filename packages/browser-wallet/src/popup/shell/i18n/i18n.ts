/* eslint-disable @typescript-eslint/no-var-requires */
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import countries from 'i18n-iso-countries';

import en from './locales/en';
import da from './locales/da';

countries.registerLocale(require('i18n-iso-countries/langs/en.json'));
countries.registerLocale(require('i18n-iso-countries/langs/da.json'));

export const defaultNS: keyof typeof en = 'shared';
const ns: Array<keyof typeof en> = Object.keys(en) as Array<keyof typeof en>;

export const resources = {
    en,
    da,
} as const;

i18n
    // detect user language
    // learn more: https://github.com/i18next/i18next-browser-languageDetector
    .use(LanguageDetector)
    // pass the i18n instance to react-i18next.
    .use(initReactI18next)
    // init i18next
    // for all options read: https://www.i18next.com/overview/configuration-options
    .init({
        debug: true,
        fallbackLng: 'en',
        defaultNS,
        ns,
        interpolation: {
            escapeValue: false, // not needed for react as it escapes by default
        },
        resources,
    });

export default i18n;
