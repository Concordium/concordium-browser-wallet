/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/destructuring-assignment */
import React, { InputHTMLAttributes, ReactNode, forwardRef, useCallback, useMemo } from 'react';
import { UseFormReturn, Validate } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { CcdAmount, ContractAddress, HexString } from '@concordium/web-sdk';
import { TokenMetadata } from '@shared/storage/types';
import SideArrow from '@assets/svgX/side-arrow.svg';
import ConcordiumLogo from '@assets/svgX/concordium-logo.svg';
import { displayAsCcd, fractionalToInteger } from 'wallet-common-helpers';
import { RequiredUncontrolledFieldProps } from '../common/types';
import { makeUncontrolled } from '../common/utils';
import Button from '../../Button';
import { formatTokenAmount } from '../../utils/helpers';
import { validateAccountAddress, validateTransferAmount } from '../../utils/transaction-helpers';
import ErrorMessage from '../ErrorMessage';

type AmountInputProps = Pick<
    InputHTMLAttributes<HTMLInputElement>,
    'className' | 'type' | 'value' | 'onChange' | 'onBlur' | 'autoFocus'
> &
    RequiredUncontrolledFieldProps<HTMLInputElement>;

/**
 * @description
 * Use as a normal \<input /\>. Should NOT be used for checkbox or radio.
 */
const InputClear = forwardRef<HTMLInputElement, AmountInputProps>(
    ({ error, className, type = 'text', ...props }, ref) => {
        return (
            <input
                className={clsx('token-amount_field', error !== undefined && 'token-amount_field--invalid', className)}
                type={type}
                ref={ref}
                autoComplete="off"
                spellCheck="false"
                {...props}
            />
        );
    }
);

const FormInputClear = makeUncontrolled(InputClear);

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

export type AmountForm = { amount: string };
export type AmountReceiveForm = AmountForm & { receiver: string };

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

const removeThousandSeparators = (value: string) => value.replace(/[,]/g, '');

export default function TokenAmount(props: Props) {
    const { t } = useTranslation('x', { keyPrefix: 'sharedX' });
    const { buttonMaxLabel, fee } = props;
    const balance = 17800021000n; // FIXME: get actual value

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
                const name = 'CCD';
                const icon = <ConcordiumLogo />;
                return { name, icon, decimals: 6, type: 'ccd' };
            }
            default:
                throw new Error('Unreachable');
        }
    }, [props]);

    const formatAmount = useCallback(
        (amountValue: bigint) => formatTokenAmount(BigInt(amountValue), selectedToken.decimals, 2),
        [selectedToken]
    );
    const parseAmount = useCallback(
        (amountValue: string) => fractionalToInteger(amountValue.replace(/[,]/g, ''), selectedToken.decimals),
        [selectedToken]
    );

    const availableAmount = useMemo(
        () => (selectedToken.type === 'ccd' ? balance - fee.microCcdAmount : balance),
        [selectedToken, fee, balance]
    );

    const setMax = useCallback(() => {
        (props.form as UseFormReturn<AmountForm>).setValue('amount', formatAmount(availableAmount) ?? '', {
            shouldDirty: true,
            shouldTouch: true,
            shouldValidate: true,
        });
    }, [availableAmount, props.form]);

    const handleAmountBlur: React.FocusEventHandler<HTMLInputElement> = useCallback(
        (event) => {
            const { value } = event.target;

            if (value === '') {
                return;
            }

            try {
                const formatted = formatAmount(parseAmount(value));
                if (formatted !== value) {
                    (props.form as UseFormReturn<AmountForm>).setValue('amount', formatted ?? '');
                }
            } catch {
                // Do nothing...
            }
        },
        [props.form, formatAmount, parseAmount]
    );

    const validateAmount: Validate<string> = useCallback(
        (value: string) =>
            validateTransferAmount(
                removeThousandSeparators(value),
                availableAmount,
                selectedToken.decimals,
                selectedToken.type === 'ccd' ? fee.microCcdAmount : 0n
            ),
        [availableAmount, selectedToken]
    );

    return (
        <div className="token-amount">
            <div className="token-amount_token">
                <span className="text__main_medium">{t('form.tokenAmount.token.label')}</span>
                <div className="token-selector">
                    <div className="token-icon">{selectedToken.icon}</div>
                    <span className="text__main">{selectedToken.name}</span>
                    {props.token === undefined && <SideArrow />}
                    <span className="text__additional_small">
                        {t('form.tokenAmount.token.available', {
                            balance: formatAmount(balance),
                            name: selectedToken.name,
                        })}
                    </span>
                </div>
            </div>
            <div className="token-amount_amount">
                <span className="text__main_medium">Amount</span>
                <div className="token-amount_amount_selector">
                    <FormInputClear
                        className="heading_medium token-amount_amount_field"
                        register={(props.form as UseFormReturn<AmountForm>).register}
                        name="amount"
                        onBlur={handleAmountBlur}
                        rules={{
                            required: t('utils.amount.required'),
                            min: { value: 0, message: t('utils.amount.zero') },
                            validate: validateAmount,
                        }}
                    />
                    <Button.Base className="capture__additional_small token-amount_amount_max" onClick={() => setMax()}>
                        {buttonMaxLabel}
                    </Button.Base>
                </div>
                <ErrorMessage className="capture__main_small">
                    {props.form.formState.errors.amount?.message}
                </ErrorMessage>
                <span className="capture__main_small">
                    {t('form.tokenAmount.amount.fee', { fee: displayAsCcd(fee, false, true) })}
                </span>
            </div>
            {props.receiver === true && (
                <div className="token-amount_receiver">
                    <span className="text__main_medium">{t('form.tokenAmount.address.label')}</span>
                    {/* TODO: Figure out what to do with overflowing text?
                        1. multiline <input type="text">
                        2. show abbreviated version on blur */}
                    <FormInputClear
                        className="text__main"
                        register={(props.form as UseFormReturn<AmountReceiveForm>).register}
                        name="receiver"
                        rules={{
                            required: t('utils.address.required'),
                            validate: validateAccountAddress,
                        }}
                    />
                    <ErrorMessage className="capture__main_small">
                        {props.form.formState.errors.receiver?.message}
                    </ErrorMessage>
                </div>
            )}
        </div>
    );
}
