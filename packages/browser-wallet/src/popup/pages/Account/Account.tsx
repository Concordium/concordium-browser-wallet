import { useAtom, useAtomValue } from 'jotai';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { accountsAtom, selectedAccountAtom } from '@popup/store/account';
import { absoluteRoutes } from '@popup/constants/routes';

export default function Account() {
    const { t } = useTranslation('account');
    const accounts = useAtomValue(accountsAtom);
    const [selectedAccount, setSelectedAccount] = useAtom(selectedAccountAtom);
    const nav = useNavigate();

    return (
        <>
            <div className="flex">
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
                <button type="button" className="m-l-10" onClick={() => nav(absoluteRoutes.home.account.add.path)}>
                    +
                </button>
            </div>
            <div className="m-t-10">{t('address', { address: selectedAccount })}</div>
        </>
    );
}
