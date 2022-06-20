import { useAtom, useAtomValue } from 'jotai';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { accountsAtom, selectedAccountAtom } from '@popup/store/account';
import { absoluteRoutes } from '@popup/constants/routes';
import Button from '@popup/shared/Button';
import { credentialsAtom } from '@popup/store/settings';

export default function Account() {
    const { t } = useTranslation('account');
    const accounts = useAtomValue(accountsAtom);
    const [selectedAccount, setSelectedAccount] = useAtom(selectedAccountAtom);
    const [creds, setCreds] = useAtom(credentialsAtom);
    const nav = useNavigate();

    const removeAccount = useCallback(() => {
        const next = creds.filter((c) => c.address !== selectedAccount);
        setCreds(next);

        if (next.length) {
            setSelectedAccount(next[0].address);
        }
    }, [creds, selectedAccount]);

    return (
        <div className="flex-column justify-center align-center">
            <div className="flex justify-space-between w-full">
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
            <div className="account-page__address">{t('address', { address: selectedAccount })}</div>
            <Button faded className="m-t-20" onClick={removeAccount}>
                Remove account (local only)
            </Button>
        </div>
    );
}
