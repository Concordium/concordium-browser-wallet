import React, { useMemo } from 'react';
import { ContractAddress, HexString } from '@concordium/web-sdk';
import { TokenMetadata } from '@shared/storage/types';
import SideArrow from '@assets/svgX/side-arrow.svg';
import ConcordiumLogo from '@assets/svgX/concordium-logo.svg';

type Token =
    | { type: 'ccd' }
    | { type: 'cis2'; data: TokenMetadata; address: { id: HexString; contract: ContractAddress.Type } };

type Props = {
    /** The token to specify an amount for. If left undefined, a token picker will be rendered */
    token?: Token;
};

export default function TokenAmount({ token }: Props) {
    const tokenName = useMemo(() => {
        switch (token?.type) {
            case 'cis2': {
                return (
                    token.data.symbol ?? token.data.name ?? `${token.address.id}@${token.address.contract.toString()}`
                );
            }
            case 'ccd':
            default:
                return 'CCD'; // FIXME: translation
        }
    }, [token]);

    return (
        <div className="token-amount">
            <div className="token-amount_token">
                <span className="text__main_medium">Token</span>
                <div className="token-selector">
                    <div className="token-icon">
                        <ConcordiumLogo />
                    </div>
                    <span className="text__main">{tokenName}</span>
                    <SideArrow />
                    <span className="text__additional_small">17,800 CCD available</span>
                </div>
            </div>
            <div className="token-amount_amount">
                <span className="text__main_medium">Amount</span>
                <div className="amount-selector">
                    <span className="heading_big">12,600.00</span>
                    <span className="capture__additional_small">Send max.</span>
                </div>
                <span className="capture__main_small">Estimated transaction fee: 0.03614 CCD</span>
            </div>
            <div className="token-amount_receiver">
                <span className="text__main_medium">Receiver address</span>
                <div className="address-selector">
                    <span className="text__main">bc1qxy2kgdygq2...0wlh</span>
                    <span className="capture__additional_small">Address Book</span>
                </div>
            </div>
        </div>
    );
}
