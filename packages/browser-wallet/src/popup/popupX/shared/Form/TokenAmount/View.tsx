/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/destructuring-assignment */
import React, { InputHTMLAttributes, ReactNode, forwardRef, useCallback, useEffect, useMemo, useState } from 'react';
import { UseFormReturn, Validate } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { CIS2, CcdAmount, ContractAddress } from '@concordium/web-sdk';
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

const parseTokenSelectorId = (value: string): null | CIS2.TokenAddress => {
    if (value.startsWith('ccd')) {
        return null;
    }

    const [, index, subindex, id] = value.split(':');
    return { id, contract: ContractAddress.create(BigInt(index), BigInt(subindex)) };
};

const formatTokenSelectorId = (address: null | CIS2.TokenAddress) => {
    if (address == null) {
        return 'ccd';
    }
    return `cis2:${address.contract.index}:${address.contract.subindex}:${address.id}`;
};

const DEFAULT_TOKEN_THUMBNAIL = DEFAULT_FAILED;

type TokenPickerProps = {
    /** null == CCD */
    selectedToken: null | TokenInfo;
    /** The set of tokens available for the account specified by `accountInfo` */
    tokens: TokenInfo[];
    /** Callback invoked when a token is selected */
    onSelect(value: null | CIS2.TokenAddress): void;
    /** Whether to enable selection */
    canSelect?: boolean;
    /** The balance of the selected token */
    selectedTokenBalance: bigint | undefined;
    /** function to format token amounts */
    formatAmount(amountValue: bigint): string;
};

function TokenPicker({
    selectedToken,
    tokens,
    onSelect,
    canSelect = false,
    selectedTokenBalance,
    formatAmount,
}: TokenPickerProps) {
    const { t } = useTranslation('x', { keyPrefix: 'sharedX' });
    const token: {
        name: string;
        icon: ReactNode;
        decimals: number;
        type: 'ccd' | 'cis2';
        address: null | CIS2.TokenAddress;
    } = useMemo(() => {
        if (selectedToken !== null) {
            const {
                metadata: { symbol, name, decimals = 0, thumbnail },
                id,
                contract,
            } = ensureDefined(
                tokens.find(
                    (tk) => tk.id === selectedToken.id && ContractAddress.equals(tk.contract, selectedToken.contract)
                ),
                'Expected the token specified to be available in the set of tokens given'
            );
            const safeName = symbol ?? name ?? `${selectedToken.id}@${selectedToken.contract.toString()}`;
            const tokenImage = thumbnail?.url ?? DEFAULT_TOKEN_THUMBNAIL;
            const icon = <Img src={tokenImage} alt={name} withDefaults />;
            return { name: safeName, icon, decimals, type: 'cis2', address: { id, contract } };
        }
        const name = 'CCD';
        const icon = <ConcordiumLogo />;
        return { name, icon, decimals: 6, type: 'ccd', address: null };
    }, [selectedToken]);

    return (
        <div className="token-selector-container">
            <label className="token-selector">
                {canSelect && (
                    <select
                        value={formatTokenSelectorId(selectedToken)}
                        onChange={(e) => onSelect(parseTokenSelectorId(e.target.value))}
                    >
                        <option value={formatTokenSelectorId(null)}>CCD</option>
                        {tokens.map((tk) => {
                            const id = formatTokenSelectorId(tk);
                            return (
                                <option key={id} value={id}>
                                    {tk.metadata.symbol ?? tk.metadata.name ?? `${tk.id}@${tk.contract.toString()}`}
                                </option>
                            );
                        })}
                    </select>
                )}
                <div className="token-icon">{token.icon}</div>
                <span className="text__main">{token.name}</span>
                {canSelect && <SideArrow />}
            </label>
            {selectedTokenBalance !== undefined && (
                <span className="text__additional_small">
                    {t('form.tokenAmount.token.available', {
                        balance: formatAmount(selectedTokenBalance),
                        name: token.name,
                    })}
                </span>
            )}
        </div>
    );
}

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

/** The event emitted when a token is selected internally. `null` is used when CCD is selected. */
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
    /**
     * Callback invoked when the user selects a token. This is also invoked when the component renders initially.
     * `null` is used to communicate the native token (CCD) is selected.
     */
    onSelectToken(event: TokenSelectEvent): void;
} & ValueVariant &
    TokenVariant;

/**
 * TokenAmount component renders a form for transferring tokens with an amount field and optionally a receiver field.
 *
 * Generally the version connected to the application store (`TokenAmount`) should be used instead of this.
 */
export default function TokenAmountView(props: TokenAmountViewProps) {
    const { t } = useTranslation('x', { keyPrefix: 'sharedX' });
    const { buttonMaxLabel, fee, tokens, balance, onSelectToken } = props;
    const [selectedToken, setSelectedToken] = useState<TokenInfo | null>(() => {
        switch (props.tokenType) {
            case 'cis2': {
                return ensureDefined(
                    tokens.find(
                        (tk) =>
                            tk.id === props.tokenAddress.id &&
                            ContractAddress.equals(tk.contract, props.tokenAddress.contract)
                    ),
                    'Expected the token specified to be available in the set of tokens given'
                );
            }
            case 'ccd':
            case undefined: {
                return null;
            }
            default:
                throw new Error('Unreachable');
        }
    });

    const handleTokenSelect = useCallback(
        (value: null | CIS2.TokenAddress) => {
            if (value === null) {
                setSelectedToken(value);
            } else {
                const selected = ensureDefined(
                    tokens.find((tk) => tk.id === value.id && ContractAddress.equals(tk.contract, value.contract)),
                    'Expected the token specified to be available in the set of tokens given'
                );
                setSelectedToken(selected);
            }
        },
        [tokens, setSelectedToken]
    );

    const tokenDecimals = useMemo(() => {
        if (selectedToken === null) {
            return 6;
        }
        return selectedToken.metadata.decimals ?? 0;
    }, [selectedToken]);

    useEffect(() => {
        onSelectToken(selectedToken);
    }, [selectedToken]);

    const formatAmount = useCallback(
        (amountValue: bigint) => formatTokenAmount(amountValue, tokenDecimals, 2),
        [tokenDecimals]
    );
    const parseAmount = useCallback(
        (amountValue: string) => parseTokenAmount(amountValue, tokenDecimals),
        [tokenDecimals]
    );

    const availableAmount: bigint | undefined = useMemo(() => {
        if (balance === undefined) {
            return undefined;
        }
        return selectedToken === null ? balance - fee.microCcdAmount : balance;
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
                balance,
                tokenDecimals,
                selectedToken === null ? fee.microCcdAmount : 0n
            ),
        [balance, tokenDecimals, selectedToken, fee]
    );

    return (
        <div className="token-amount">
            <div className="token-amount_token">
                <span className="text__main_medium">{t('form.tokenAmount.token.label')}</span>
                {props.tokenType !== undefined ? (
                    <TokenPicker
                        selectedToken={selectedToken}
                        onSelect={handleTokenSelect}
                        tokens={tokens}
                        selectedTokenBalance={availableAmount}
                        formatAmount={formatAmount}
                    />
                ) : (
                    <TokenPicker
                        selectedToken={selectedToken}
                        onSelect={handleTokenSelect}
                        tokens={tokens}
                        canSelect
                        selectedTokenBalance={availableAmount}
                        formatAmount={formatAmount}
                    />
                )}
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
