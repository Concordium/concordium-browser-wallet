/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/destructuring-assignment */
import React, { InputHTMLAttributes, ReactNode, forwardRef, useCallback, useEffect, useMemo } from 'react';
import { UseFormReturn, Validate } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { ClassName, displayAsCcd } from 'wallet-common-helpers';
import { CIS2, CcdAmount, ContractAddress } from '@concordium/web-sdk';

import { CCD_METADATA } from '@shared/constants/token-metadata';
import { ensureDefined } from '@shared/utils/basic-helpers';
import SideArrow from '@assets/svgX/side-arrow.svg';
import ConcordiumLogo from '@assets/svgX/concordium-logo.svg';
import { validateAccountAddress, validateTransferAmount } from '@popup/shared/utils/transaction-helpers';
import { TokenMetadata } from '@shared/storage/types';
import Img, { DEFAULT_FAILED } from '@popup/shared/Img';
import Text from '@popup/popupX/shared/Text';

import { RequiredControlledFieldProps, RequiredUncontrolledFieldProps } from '../common/types';
import { makeControlled, makeUncontrolled } from '../common/utils';
import Button from '../../Button';
import { formatTokenAmount, parseTokenAmount, removeNumberGrouping } from '../../utils/helpers';
import ErrorMessage from '../ErrorMessage';
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

type ReceiverInputProps = Pick<
    InputHTMLAttributes<HTMLTextAreaElement>,
    'className' | 'value' | 'onChange' | 'onBlur' | 'autoFocus' | 'placeholder'
> &
    RequiredUncontrolledFieldProps<HTMLInputElement>;

/**
 * @description
 * Use as a normal \<textarea /\>.
 */
const ReceiverInput = forwardRef<HTMLTextAreaElement, ReceiverInputProps>(({ error, className, ...props }, ref) => {
    return (
        <textarea
            className={clsx('token-amount_field', error !== undefined && 'token-amount_field--invalid', className)}
            ref={ref}
            autoComplete="off"
            spellCheck="false"
            {...props}
        />
    );
});

const FormReceiverInput = makeUncontrolled(ReceiverInput);

const parseTokenSelectorId = (value: string): Exclude<TokenPickerVariant, undefined> => {
    if (value.startsWith('ccd')) {
        return { tokenType: 'ccd' };
    }

    const [, index, subindex, id] = value.split(':');
    return {
        tokenType: 'cis2',
        tokenAddress: { id, contract: ContractAddress.create(BigInt(index), BigInt(subindex)) },
    };
};

const formatTokenSelectorId = (token: TokenPickerVariant) => {
    if (token?.tokenType === 'cis2') {
        return `cis2:${token.tokenAddress.contract.index}:${token.tokenAddress.contract.subindex}:${token.tokenAddress.id}`;
    }
    return 'ccd';
};

const DEFAULT_TOKEN_THUMBNAIL = DEFAULT_FAILED;

type TokenPickerProps = RequiredControlledFieldProps<TokenPickerVariant> & {
    /** The set of tokens available for the account specified by `accountInfo` */
    tokens: TokenInfo[];
    /** Whether to enable selection */
    canSelect?: boolean;
    /** The balance of the selected token */
    selectedTokenBalance: bigint | undefined;
    /** function to format token amounts */
    formatAmount(amountValue: bigint): string;
};

function TokenPicker({
    tokens,
    onChange,
    value,
    onBlur,
    canSelect = false,
    selectedTokenBalance,
    formatAmount,
}: TokenPickerProps) {
    const { t } = useTranslation('x', { keyPrefix: 'sharedX' });
    const token:
        | {
              name: string;
              icon: ReactNode;
              decimals: number;
              type: 'ccd' | 'cis2';
              address: null | CIS2.TokenAddress;
          }
        | undefined = useMemo(() => {
        if (value?.tokenType === undefined) return undefined;
        if (value.tokenType === 'ccd') {
            const name = 'CCD';
            const icon = <ConcordiumLogo />;
            return { name, icon, decimals: 6, type: 'ccd', address: null };
        }

        const {
            metadata: { symbol, name, decimals = 0, thumbnail },
            id,
            contract,
        } = ensureDefined(
            tokens.find(
                (tk) =>
                    tk.id === value.tokenAddress.id && ContractAddress.equals(tk.contract, value.tokenAddress.contract)
            ),
            'Expected the token specified to be available in the set of tokens given'
        );
        const safeName = symbol ?? name ?? `${value.tokenAddress.id}@${value.tokenAddress.contract.toString()}`;
        const tokenImage = thumbnail?.url ?? DEFAULT_TOKEN_THUMBNAIL;
        const icon = <Img src={tokenImage} alt={name} withDefaults />;
        return { name: safeName, icon, decimals, type: 'cis2', address: { id, contract } };
    }, [value]);

    return (
        <div className="token-selector-container">
            <label className="token-selector">
                {canSelect && (
                    <select
                        value={formatTokenSelectorId(value)}
                        onChange={(e) => onChange?.(parseTokenSelectorId(e.target.value))}
                        onBlur={onBlur}
                    >
                        <option value={formatTokenSelectorId({ tokenType: 'ccd' })}>CCD</option>
                        {tokens.map((tk) => {
                            const id = formatTokenSelectorId({ tokenType: 'cis2', tokenAddress: tk });
                            return (
                                <option key={id} value={id}>
                                    {tk.metadata.symbol ?? tk.metadata.name ?? `${tk.id}@${tk.contract.toString()}`}
                                </option>
                            );
                        })}
                    </select>
                )}
                {token !== undefined && <div className="token-icon">{token.icon}</div>}
                <Text.Main>{token?.name}</Text.Main>
                {canSelect && <SideArrow />}
            </label>
            {selectedTokenBalance !== undefined && (
                <span className="text__additional_small">
                    {t('form.tokenAmount.token.available', {
                        balance: formatAmount(selectedTokenBalance),
                    })}
                </span>
            )}
        </div>
    );
}

const FormTokenPicker = makeControlled(TokenPicker);

/** Possible values of the token picker */
export type TokenPickerVariant =
    | {
          /** The token type. If undefined, a token picker is rendered */
          tokenType: 'ccd';
      }
    | {
          /** The token type. If undefined, a token picker is rendered */
          tokenType: 'cis2';
          /** The token address */
          tokenAddress: CIS2.TokenAddress;
      };
type TokenPickerVariantProps = { tokenType?: undefined } | TokenPickerVariant;

/**
 * @description
 * Represents a form with an amount field.
 */
export type AmountForm = {
    /** The amount to be transferred */
    amount: string;
    /** The token to transfer */
    token: TokenPickerVariant;
};

/**
 * @description
 * Represents a form with an amount field and a receiver field.
 */
export type AmountReceiveForm = AmountForm & {
    /** The receiver of the amount */
    receiver: string;
};

type ValueVariantProps =
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

export type TokenAmountViewProps = {
    /** The CCD balance used to check transaction fee coverage */
    ccdBalance: CcdAmount.Type;
    /** The label used for the button setting the amount to the maximum possible */
    buttonMaxLabel: string;
    /** The fee associated with the transaction */
    fee: CcdAmount.Type;
    /** A custom function for formatting the fee. Defaults to `displayAsCcd(fee, false, true)` */
    formatFee?(fee: CcdAmount.Type): ReactNode;
    /** The set of tokens available for the account specified by `accountInfo` */
    tokens: TokenInfo[];
    /** The token balance. `undefined` should be used to indicate that the balance is not yet available. */
    balance: bigint | undefined;
    /** Custom validation for the amount */
    validateAmount?: Validate<string>;
} & ValueVariantProps &
    TokenPickerVariantProps &
    ClassName;

/**
 * TokenAmount component renders a form for transferring tokens with an amount field and optionally a receiver field.
 *
 * Generally the version connected to the application store (`TokenAmount`) should be used instead of this.
 */
export default function TokenAmountView(props: TokenAmountViewProps) {
    const { t } = useTranslation('x', { keyPrefix: 'sharedX' });
    const {
        buttonMaxLabel,
        fee,
        tokens,
        balance,
        className,
        ccdBalance,
        formatFee = (f) => displayAsCcd(f, false, true),
        validateAmount: customValidateAmount,
    } = props;
    const defaultToken: TokenPickerVariant = useMemo(() => {
        switch (props.tokenType) {
            case 'ccd':
            case undefined:
                return { tokenType: 'ccd' };
            case 'cis2':
                return { tokenType: 'cis2', tokenAddress: props.tokenAddress };
            default:
                throw new Error('Unreachable');
        }
    }, [props.tokenType]);
    const { token = defaultToken } = props.form.watch();
    const selectedTokenMetadata = useMemo<TokenMetadata>(() => {
        switch (token.tokenType) {
            case 'cis2': {
                return ensureDefined(
                    tokens.find(
                        (tk) =>
                            tk.id === token.tokenAddress.id &&
                            ContractAddress.equals(tk.contract, token.tokenAddress.contract)
                    ),
                    'Expected the token specified to be available in the set of tokens given'
                ).metadata;
            }
            case 'ccd':
            case undefined:
                return CCD_METADATA;
            default:
                throw new Error('Unreachable');
        }
    }, [token]);

    useEffect(() => {
        const form = props.form as UseFormReturn<AmountForm>;
        form.setValue('token', defaultToken);
    }, []);

    const tokenDecimals = useMemo(() => {
        return selectedTokenMetadata.decimals ?? 0;
    }, [selectedTokenMetadata]);

    const formatAmount = useCallback(
        (amountValue: bigint) => formatTokenAmount(amountValue, tokenDecimals, Math.min(2, tokenDecimals)),
        [tokenDecimals]
    );
    const parseAmount = useCallback(
        (amountValue: string) => parseTokenAmount(amountValue, tokenDecimals),
        [tokenDecimals]
    );

    const availableAmount: bigint | undefined = useMemo(() => {
        if (balance === undefined || token === undefined) {
            return undefined;
        }
        return token.tokenType === 'ccd' ? balance - fee.microCcdAmount : balance;
    }, [token, fee, balance]);

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
            const form = props.form as UseFormReturn<AmountForm>;

            if (value === '' || form.getFieldState('amount').error !== undefined) {
                return;
            }

            try {
                const formatted = formatAmount(parseAmount(value));
                if (formatted !== value) {
                    form.setValue('amount', formatted ?? '');
                }
            } catch {
                // Do nothing...
            }
        },
        [props.form, formatAmount, parseAmount]
    );

    const validateAmount: Validate<string> = useCallback(
        (value) => {
            const [, fractions = ''] = value.split('.');
            if (fractions.length > tokenDecimals) {
                return t('form.tokenAmount.validation.incorrectDecimals', { num: tokenDecimals });
            }
            const sanitizedValue = removeNumberGrouping(value);
            if (token.tokenType === 'cis2' && ccdBalance.microCcdAmount < fee.microCcdAmount) {
                return t('form.tokenAmount.validation.insufficientCcd');
            }
            return validateTransferAmount(sanitizedValue, balance, tokenDecimals, fee.microCcdAmount);
        },
        [balance, tokenDecimals, token, fee]
    );

    return (
        <div className={clsx('token-amount', className)}>
            <div className="token-amount_token">
                <span className="text__main_medium">{t('form.tokenAmount.token.label')}</span>
                <FormTokenPicker
                    control={(props.form as UseFormReturn<AmountForm>).control}
                    name="token"
                    tokens={tokens}
                    canSelect={props.tokenType === undefined}
                    selectedTokenBalance={balance}
                    formatAmount={formatAmount}
                />
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
                            validate: (v) => validateAmount(v) ?? customValidateAmount?.(v),
                        }}
                    />
                    <Button.Base className="capture__additional_small token-amount_amount_max" onClick={() => setMax()}>
                        {buttonMaxLabel}
                    </Button.Base>
                </div>
                <ErrorMessage className="capture__main_small">
                    {props.form.formState.errors.amount?.message}
                </ErrorMessage>
                <Text.Capture>
                    {t('form.tokenAmount.amount.fee')} {formatFee(fee)}
                </Text.Capture>
            </div>
            {props.receiver === true && (
                <div className="token-amount_receiver">
                    <span className="text__main_medium">{t('form.tokenAmount.address.label')}</span>
                    <FormReceiverInput
                        className="text__main"
                        register={(props.form as UseFormReturn<AmountReceiveForm>).register}
                        name="receiver"
                        placeholder={t('form.tokenAmount.address.placeholder')}
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
