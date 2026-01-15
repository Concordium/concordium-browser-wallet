import React from 'react';
import clsx from 'clsx';
import UpDown from '@assets/svgX/caret-up-down.svg';
import LedgerIcon from '@assets/svgX/ledger-account.svg';
import { displayNameOrSplitAddress } from '@popup/shared/utils/account-helpers';
import { useAtomValue } from 'jotai';
import { credentialsAtom, selectedCredentialAtom } from '@popup/store/account';
import { useTranslation } from 'react-i18next';
import { isLedgerAccount } from '@shared/utils/account-type-helpers';

export default function AccountButton({
    hideAccountButton,
    accountOpen,
    setAccountOpen,
}: {
    hideAccountButton?: boolean;
    accountOpen?: boolean;
    setAccountOpen: (open: boolean) => void;
}) {
    const { t } = useTranslation('x', { keyPrefix: 'header.accountButton' });
    const credential = useAtomValue(selectedCredentialAtom);
    const credentials = useAtomValue(credentialsAtom);

    if (hideAccountButton) return null;

    if (credential === undefined && credentials.length === 0) {
        return (
            <div className={clsx('header__account')}>
                <span className="text__main_medium red">{t('noAccounts')}</span>
            </div>
        );
    }

    if (credential === undefined) {
        return null;
    }

    return (
        // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
        <div className={clsx('header__account', accountOpen && 'active')} onClick={() => setAccountOpen(!accountOpen)}>
            {isLedgerAccount(credential) && <LedgerIcon width="16" height="16" title="Ledger Based Account" />}
            <span className="text__main_medium">{displayNameOrSplitAddress(credential)}</span>
            <UpDown />
        </div>
    );
}
