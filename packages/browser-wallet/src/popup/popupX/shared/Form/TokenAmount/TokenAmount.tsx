/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/destructuring-assignment */
import React, { InputHTMLAttributes, ReactNode, forwardRef, useCallback, useMemo } from 'react';
import { UseFormReturn } from 'react-hook-form';
import clsx from 'clsx';
import { CcdAmount, ContractAddress, HexString } from '@concordium/web-sdk';
import { TokenMetadata } from '@shared/storage/types';
import SideArrow from '@assets/svgX/side-arrow.svg';
import ConcordiumLogo from '@assets/svgX/concordium-logo.svg';
import { addThousandSeparators, displayAsCcd, integerToFractional } from 'wallet-common-helpers';
import { RequiredControlledFieldProps } from '../common/types';
import { makeControlled } from '../common/utils';
import Button from '../../Button';

type AmountInputProps = Pick<
    InputHTMLAttributes<HTMLInputElement>,
    'className' | 'type' | 'value' | 'onChange' | 'onBlur' | 'autoFocus'
> &
    RequiredControlledFieldProps;

/**
 * @description
 * Use as a normal \<input /\>. Should NOT be used for checkbox or radio.
 */
const AmountInput = forwardRef<HTMLInputElement, AmountInputProps>(
    ({ error, className, type = 'text', valid, ...props }, ref) => {
        return (
            <input
                className={clsx('heading_medium', className)}
                type={type}
                ref={ref}
                autoComplete="off"
                spellCheck="false"
                {...props}
            />
        );
    }
);

const FormAmountInput = makeControlled(AmountInput);

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

type AmountForm = { amount: string };
type AmountReceiveForm = AmountForm & { receiver: string };

type ValueVariants =
    | {
          /** Whether it should be possible to specify a receiver. Defaults to false */
          receiver?: false;
          /** The form type control for the inner fields */
          form: UseFormReturn<AmountForm>;
      }
    | {
          /** Whether it should be possible to specify a receiver. Defaults to false */
          receiver: true;
          /** The form type control for the inner fields */
          form: UseFormReturn<AmountReceiveForm>;
      };

type Props = {
    /** The label used for the button setting the amount to the maximum possible */
    buttonMaxLabel: string;
    /** The fee associated with the transaction */
    fee: CcdAmount.Type;
} & ValueVariants &
    TokenVariants;

export default function TokenAmount(props: Props) {
    const { buttonMaxLabel, fee } = props;

    const selectedToken: { name: string; icon: ReactNode; decimals: number; type: 'ccd' | 'cis2' } = useMemo(() => {
        switch (props.token) {
            case 'cis2': {
                const { symbol, name, decimals = 0 }: TokenMetadata = { symbol: 'wETH', decimals: 18 }; // FIXME: hook up to actual metadata
                const safeName = symbol ?? name ?? `${props.address.id}@${props.address.contract.toString()}`;
                const icon = <ConcordiumLogo />; // FIXME: get token icon
                return { name: safeName, icon, decimals, type: 'cis2' };
            }
            case 'ccd':
            case undefined: {
                const name = 'CCD'; // FIXME: translation
                const icon = <ConcordiumLogo />;
                return { name, icon, decimals: 6, type: 'ccd' };
            }
            default:
                throw new Error('Unreachable');
        }
    }, [props]);

    const formatAmount = useCallback(integerToFractional(selectedToken.decimals), [selectedToken]);
    const balance = 17800021000n; // FIXME: get actual value

    const setMax = useCallback(() => {
        const available = selectedToken.type === 'ccd' ? balance - fee.microCcdAmount : balance;
        (props.form as UseFormReturn<AmountForm>).setValue('amount', formatAmount(available) ?? '', {
            shouldDirty: true,
            shouldTouch: true,
            shouldValidate: true,
        });
    }, [selectedToken, props.form]);

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
                        {addThousandSeparators(formatAmount(balance))} {selectedToken.name} available
                    </span>
                </div>
            </div>
            <div className="token-amount_amount">
                <span className="text__main_medium">Amount</span>
                <div className="token-amount_amount_selector">
                    {/* FIXME: format amount properly */}
                    {/* TODO: ensure the value does not overflow the max amount of space available */}
                    <FormAmountInput
                        className="token-amount_amount_field"
                        control={(props.form as UseFormReturn<AmountForm>).control}
                        name="amount"
                    />
                    <Button.Base className="capture__additional_small token-amount_amount_max" onClick={() => setMax()}>
                        {buttonMaxLabel}
                    </Button.Base>
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
                        <span className="text__main">
                            {/* values.receiver ? AccountAddress.toBase58(values.receiver) : '' */}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}
