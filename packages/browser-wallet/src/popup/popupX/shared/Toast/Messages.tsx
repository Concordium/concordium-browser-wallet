import React from 'react';
import Check from '@assets/svgX/check.svg';
import { displaySplitAddressShort } from '@popup/shared/utils/account-helpers';
import Text from '@popup/popupX/shared/Text';

export function CopyAddress({ address, message }: { address: string; message: string }) {
    return (
        <div className="copy-address-x">
            <Check />
            <div className="copy-message">
                <Text.Label>{message}</Text.Label>
                <Text.Capture>{displaySplitAddressShort(address)}</Text.Capture>
            </div>
        </div>
    );
}
