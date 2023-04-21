import CopyButton from '@popup/shared/CopyButton';
import React, { useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { DisplayAsQR, DisplayAddress as DisplayAccountAddress, AddressDisplayFormat } from 'wallet-common-helpers';
import { useAtomValue } from 'jotai';
import { selectedAccountAtom } from '@popup/store/account';
import { accountPageContext } from '../utils';

export default function DisplayAddress() {
    const { t } = useTranslation('account');
    const address = useAtomValue(selectedAccountAtom);
    const { setDetailsExpanded } = useContext(accountPageContext);

    useEffect(() => {
        setDetailsExpanded(true);
    }, []);

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
