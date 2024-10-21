/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/destructuring-assignment */
import React, { InputHTMLAttributes, ReactNode, forwardRef, useCallback, useEffect, useMemo } from 'react';
import { UseFormReturn, Validate } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { AccountInfo, CIS2, CcdAmount, ContractAddress } from '@concordium/web-sdk';
import { ensureDefined } from '@shared/utils/basic-helpers';
import SideArrow from '@assets/svgX/side-arrow.svg';
import ConcordiumLogo from '@assets/svgX/concordium-logo.svg';
import { displayAsCcd } from 'wallet-common-helpers';
import { RequiredUncontrolledFieldProps } from '../common/types';
import { makeUncontrolled } from '../common/utils';
import Button from '../../Button';
import { formatTokenAmount, parseTokenAmount, removeNumberGrouping } from '../../utils/helpers';
import { validateAccountAddress, validateTransferAmount } from '../../utils/transaction-helpers';
import ErrorMessage from '../ErrorMessage';
import Img, { DEFAULT_FAILED } from '../../Img';
import { TokenInfo } from './util';

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

type TokenVariant =
    | {
          /** The token type. If undefined, a token picker is rendered */
          tokenType?: 'ccd';
      }
    | {
          /** The token type. If undefined, a token picker is rendered */
          tokenType: 'cis2';
          /** The token address */
          tokenAddress: CIS2.TokenAddress;
      };

/**
 * @description
 * Represents a form with an amount field.
 */
export type AmountForm = {
    /** The amount to be transferred */
    amount: string;
};

/**
 * @description
 * Represents a form with an amount field and a receiver field.
 */
export type AmountReceiveForm = AmountForm & {
    /** The receiver of the amount */
    receiver: string;
};

type ValueVariant =
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

export type TokenSelectEvent = null | CIS2.TokenAddress;

export type TokenAmountViewProps = {
    /** The label used for the button setting the amount to the maximum possible */
    buttonMaxLabel: string;
    /** The fee associated with the transaction */
    fee: CcdAmount.Type;
    /** The set of tokens available for the account specified by `accountInfo` */
    tokens: TokenInfo[];
    /** The token balance. `undefined` should be used to indicate that the balance is not yet available. */
    balance: bigint | undefined;
    /** Callback invoked when the user selects a token. This is also invoked when the component renders initially */
    onSelectToken(event: TokenSelectEvent): void;
} & ValueVariant &
    TokenVariant;

const DEFAULT_TOKEN_THUMBNAIL = DEFAULT_FAILED;

// TODO: Token picker...
// [x] Get values from store
// [x] Token images
// [ ] Token picker

/**
 * TokenAmount component renders a form for transferring tokens with an amount field and optionally a receiver field.
 *
 * Generally the version connected to the application store (`TokenAmount`) should be used instead of this.
 */
export default function TokenAmountView(props: TokenAmountViewProps) {
    const { t } = useTranslation('x', { keyPrefix: 'sharedX' });
    const { buttonMaxLabel, fee, tokens, balance, onSelectToken } = props;

    const selectedToken: {
        name: string;
        icon: ReactNode;
        decimals: number;
        type: 'ccd' | 'cis2';
        address: null | CIS2.TokenAddress;
    } = useMemo(() => {
        switch (props.tokenType) {
            case 'cis2': {
                const {
                    metadata: { symbol, name, decimals = 0, thumbnail },
                    id,
                    contract,
                } = ensureDefined(
                    tokens.find(
                        (tk) =>
                            tk.id === props.tokenAddress.id &&
                            ContractAddress.equals(tk.contract, props.tokenAddress.contract)
                    ),
                    'Expected the token specified to be available in the set of tokens given'
                );
                const safeName = symbol ?? name ?? `${props.tokenAddress.id}@${props.tokenAddress.contract.toString()}`;
                const tokenImage = thumbnail?.url ?? DEFAULT_TOKEN_THUMBNAIL;
                const icon = <Img src={tokenImage} alt={name} withDefaults />;
                return { name: safeName, icon, decimals, type: 'cis2', address: { id, contract } };
            }
            case 'ccd':
            case undefined: {
                const name = 'CCD';
                const icon = <ConcordiumLogo />;
                return { name, icon, decimals: 6, type: 'ccd', address: null };
            }
            default:
                throw new Error('Unreachable');
        }
    }, [props]);

    useEffect(() => {
        if (selectedToken.type === 'cis2') {
            const { id, contract } = ensureDefined(
                tokens.find(
                    (tk) =>
                        tk.id === selectedToken.address!.id &&
                        ContractAddress.equals(tk.contract, selectedToken.address!.contract)
                ),
                'Expected selected token to be in tokens list'
            );
            onSelectToken({ id, contract });
        } else {
            onSelectToken(null);
        }
    }, [selectedToken]);

    const formatAmount = useCallback(
        (amountValue: bigint) => formatTokenAmount(BigInt(amountValue), selectedToken.decimals, 2),
        [selectedToken]
    );
    const parseAmount = useCallback(
        (amountValue: string) => parseTokenAmount(amountValue, selectedToken.decimals),
        [selectedToken]
    );

    const availableAmount: bigint | undefined = useMemo(() => {
        if (balance === undefined) {
            return undefined;
        }
        return selectedToken.type === 'ccd' ? balance - fee.microCcdAmount : balance;
    }, [selectedToken, fee, balance]);

    const setMax = useCallback(() => {
        if (availableAmount === undefined) return;

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
        (value) =>
            validateTransferAmount(
                removeNumberGrouping(value),
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
                    {props.tokenType === undefined && <SideArrow />}
                    {balance !== undefined && (
                        <span className="text__additional_small">
                            {t('form.tokenAmount.token.available', {
                                balance: formatAmount(balance),
                                name: selectedToken.name,
                            })}
                        </span>
                    )}
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
