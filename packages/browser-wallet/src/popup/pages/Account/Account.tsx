import { useAtomValue } from 'jotai';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { selectedAccountAtom } from '@popup/store/account';

export default function Account() {
    const { t } = useTranslation('account');
    const address = useAtomValue(selectedAccountAtom);

    return <div>{t('address', { address })}</div>;
}
