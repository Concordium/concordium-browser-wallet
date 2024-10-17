/* eslint-disable react/destructuring-assignment */
import React, { ReactNode, useCallback, useMemo } from 'react';
import { AccountAddress, CcdAmount, ContractAddress, HexString } from '@concordium/web-sdk';
import { TokenMetadata } from '@shared/storage/types';
import SideArrow from '@assets/svgX/side-arrow.svg';
import ConcordiumLogo from '@assets/svgX/concordium-logo.svg';
import { addThousandSeparators, displayAsCcd, integerToFractional } from 'wallet-common-helpers';

type TokenVariants =
    | {
          /** The token type */
          token?: undefined;
      }
    | {
          /** The token type */
          token: 'ccd';
      }
    | {
          /** The token type */
          token: 'cis2';
          /** The token address */
          address: {
              /** The token ID within the contract */
              id: HexString;
              /** The token contract address */
              contract: ContractAddress.Type;
          };
      };

type FieldProps<V> = {
    /** The field value */
    value: V | undefined;
    /** A value change handler */
    onChange?(value: V): void;
};

type ValueVariants =
    | ({
          /** Whether it should be possible to specify a receiver. Defaults to false */
          receiver?: false;
      } & FieldProps<{
          /** The amount */
          amount: bigint;
      }>)
    | ({
          /** Whether it should be possible to specify a receiver. Defaults to false */
          receiver: true;
      } & FieldProps<{
          /** The amount */
          amount: bigint;
          /** The specified receiver of the amount */
          receiver: AccountAddress.Type;
      }>);

type Props = {
    /** The label used for the button setting the amount to the maximum possible */
    buttonMaxLabel: string;
    /** The fee associated with the transaction */
    fee: CcdAmount.Type;
} & ValueVariants &
    TokenVariants;

export default function TokenAmount(props: Props) {
    const { buttonMaxLabel, fee } = props;

    const selectedToken: { name: string; icon: ReactNode; decimals: number } = useMemo(() => {
        switch (props.token) {
            case 'cis2': {
                const { symbol, name, decimals = 0 }: TokenMetadata = { symbol: 'wETH', decimals: 18 }; // FIXME: hook up to actual metadata
                const safeName = symbol ?? name ?? `${props.address.id}@${props.address.contract.toString()}`;
                const icon = <ConcordiumLogo />; // FIXME: get token icon
                return { name: safeName, icon, decimals };
            }
            case 'ccd':
            case undefined: {
                const name = 'CCD'; // FIXME: translation
                const icon = <ConcordiumLogo />;
                return { name, icon, decimals: 6 };
            }
            default:
                throw new Error('Unreachable');
        }
    }, [props]);
    const amount = useMemo(() => props.value?.amount ?? CcdAmount.zero(), [props.value?.amount]);
    const formatAmount = useCallback(
        (someAmount: bigint) => {
            return addThousandSeparators(integerToFractional(selectedToken.decimals)(someAmount));
        },
        [selectedToken]
    );
    const balance = 17800021000n; // FIXME: get actual value

    return (
        <div className="token-amount">
            <div className="token-amount_token">
                <span className="text__main_medium">Token</span>
                <div className="token-selector">
                    <div className="token-icon">{selectedToken.icon}</div>
                    <span className="text__main">{selectedToken.name}</span>
                    {props.token === undefined && <SideArrow />}
                    {/* FIXME: translation */}
                    <span className="text__additional_small">
                        {formatAmount(balance)} {selectedToken.name} available
                    </span>
                </div>
            </div>
            <div className="token-amount_amount">
                <span className="text__main_medium">Amount</span>
                <div className="amount-selector">
                    {/* FIXME: format amount properly, change to input field */}
                    <span className="heading_big">{amount.toString()}</span>{' '}
                    <span className="capture__additional_small">{buttonMaxLabel}</span>
                </div>
                {/* FIXME: translate */}
                <span className="capture__main_small">Estimated transaction fee: {displayAsCcd(fee, false, true)}</span>
            </div>
            {props.receiver === true && (
                <div className="token-amount_receiver">
                    {/* FIXME: translate */}
                    <span className="text__main_medium">Receiver address</span>
                    <div className="address-selector">
                        {/* FIXME: format as design */}
                        <span className="text__main">{props.value?.receiver.toString()}</span>
                    </div>
                </div>
            )}
        </div>
    );
}
