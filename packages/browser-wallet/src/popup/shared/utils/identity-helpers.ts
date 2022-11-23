import { useTranslation } from 'react-i18next';
import sharedTranslations from '../i18n/en';

export function useGetAttributeName() {
    const { t } = useTranslation('shared', { keyPrefix: 'idAttributes' });

    return (attributeKey: keyof typeof sharedTranslations.idAttributes) => {
        return attributeKey in sharedTranslations.idAttributes ? t(attributeKey) : attributeKey;
    };
}
