// import the original type declarations
import 'react-i18next';
import type { resources, defaultNS } from '../popup/shell/i18n';

// react-i18next versions higher than 11.11.0
declare module 'react-i18next' {
    // and extend them!
    interface CustomTypeOptions {
        // custom namespace type if you changed it
        defaultNS: Extract<typeof defaultNS, 'shared'>;
        // custom resources type
        resources: typeof resources['en'];
    }
}
