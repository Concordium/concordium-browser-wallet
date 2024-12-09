import React from 'react';
import clsx from 'clsx';
import UpDown from '@assets/svgX/caret-up-down.svg';
import { displayNameOrSplitAddress } from '@popup/shared/utils/account-helpers';
import { useAtomValue } from 'jotai';
import { selectedCredentialAtom } from '@popup/store/account';

export default function AccountButton({
    hideAccountButton,
    accountOpen,
    setAccountOpen,
}: {
    hideAccountButton?: boolean;
    accountOpen?: boolean;
    setAccountOpen: (open: boolean) => void;
}) {
    const credential = useAtomValue(selectedCredentialAtom);

    if (credential === undefined) {
        return null;
    }

    if (hideAccountButton) return null;

    return (
        // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
        <div className={clsx('header__account', accountOpen && 'active')} onClick={() => setAccountOpen(!accountOpen)}>
            <span className="text__main_medium">{displayNameOrSplitAddress(credential)}</span>
            <UpDown />
        </div>
    );
}
