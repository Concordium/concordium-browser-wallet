import { useAtom, useAtomValue } from 'jotai';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { accountsAtom, selectedAccountAtom } from '@popup/store/account';

export default function Account() {
    const { t } = useTranslation('account');
    const accounts = useAtomValue(accountsAtom);
    const [selectedAccount, setSelectedAccount] = useAtom(selectedAccountAtom);

    return (
        <>
            <select
                className="account-page__select-account"
                value={selectedAccount}
                onChange={(e) => setSelectedAccount(e.target.value)}
            >
                {accounts.map((a) => (
                    <option key={a} value={a}>
                        {a}
                    </option>
                ))}
            </select>
            <div className="m-t-10">{t('address', { address: selectedAccount })}</div>
        </>
    );
}
