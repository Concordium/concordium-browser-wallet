import { useAtom, useAtomValue } from 'jotai';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { accountsAtom, selectedAccountAtom } from '@popup/store/account';
import { absoluteRoutes } from '@popup/constants/routes';
import Button from '@popup/shared/Button';
import { credentialsAtom, urlWhitelistAtom } from '@popup/store/settings';

export default function Account() {
    const { t } = useTranslation('account');
    const accounts = useAtomValue(accountsAtom);
    const [selectedAccount, setSelectedAccount] = useAtom(selectedAccountAtom);
    const [creds, setCreds] = useAtom(credentialsAtom);
    const [whitelist, setWhitelist] = useAtom(urlWhitelistAtom);
    const nav = useNavigate();

    const removeAccount = useCallback(() => {
        const next = creds.filter((c) => c.address !== selectedAccount);
        setCreds(next);

        setSelectedAccount(next[0]?.address);
    }, [creds, selectedAccount]);

    const removeConnections = useCallback(() => {
        setWhitelist([]);
    }, []);

    return (
        <div className="flex-column justify-center align-center">
            <div className="flex justify-space-between w-full">
                {accounts.length > 0 ? (
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
                ) : (
                    <div>{t('noAccounts')}</div>
                )}
                <button type="button" className="m-l-10" onClick={() => nav(absoluteRoutes.home.account.add.path)}>
                    +
                </button>
            </div>
            {selectedAccount !== undefined && (
                <>
                    <div className="account-page__address">{t('address', { address: selectedAccount })}</div>
                    <Button danger className="m-t-20" onClick={removeAccount}>
                        {t('removeAccount')}
                    </Button>
                </>
            )}
            <Button disabled={!whitelist.length} danger className="m-t-20" onClick={removeConnections}>
                {t('resetConnections')}
            </Button>
        </div>
    );
}
