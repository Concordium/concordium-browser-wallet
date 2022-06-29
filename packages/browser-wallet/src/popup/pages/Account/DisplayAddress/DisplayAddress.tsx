import CopyButton from '@popup/shared/CopyButton';
import React from 'react';
import { useTranslation } from 'react-i18next';
import DisplayAsQR from 'wallet-common-helpers/src/components/DisplayAsQR';
import DisplayAccountAddress, { AddressDisplayFormat } from 'wallet-common-helpers/src/components/DisplayAddress';
import { useAtomValue } from 'jotai';
import { selectedAccountAtom } from '@popup/store/account';

export default function DisplayAddress() {
    const { t } = useTranslation('account');
    const address = useAtomValue(selectedAccountAtom);

    if (!address) {
        return null;
    }

    return (
        <div className="display-address__container">
            <p className="m-t-0 m-b-10">{t('accountAddress')}</p>
            <DisplayAsQR value={address} className="display-address__address-qr" />
            <div className="flex m-t-10 align-center">
                <DisplayAccountAddress
                    className="display-address__address-text"
                    format={AddressDisplayFormat.DoubleLine}
                    address={address}
                />
                <CopyButton className="display-address__copy" value={address} />
            </div>
        </div>
    );
}
