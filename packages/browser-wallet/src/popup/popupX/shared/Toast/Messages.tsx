import React from 'react';
import { displaySplitAddressShort } from '@popup/shared/utils/account-helpers';
import Text from '@popup/popupX/shared/Text';
import Check from '@assets/svgX/check.svg';
import Info from '@assets/svgX/info-black.svg';

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

export function GenericMessage({ title, message }: { title: string; message?: string }) {
    return (
        <div className="generic-toast-x">
            <Info />
            <div className="generic-toast-message">
                <Text.Label>{title}</Text.Label>
                <Text.Capture>{message}</Text.Capture>
            </div>
        </div>
    );
}
