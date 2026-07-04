import React, { useRef } from 'react';
import { atomFamily, selectAtom, useAtomValue } from 'jotai/utils';
import { AccountAddress, AccountInfo, CIS2, ContractAddress } from '@concordium/web-sdk';
import { Cbor, TokenModuleAccountState } from '@concordium/web-sdk/plt';
import { atom } from 'jotai';

import { accountInfoFamily } from '@popup/shared/AccountInfoListenerContext/AccountInfoListenerContext';
import { contractBalancesFamily } from '@popup/store/token';
import { PLT } from '@shared/constants/token';
import TokenAmountView, { TokenAmountViewProps } from './View';
import { useTokenInfo } from './util';

const tokenAddressEq = (a: CIS2.TokenAddress | null, b: CIS2.TokenAddress | null) => {
    if (a !== null && b !== null) {
        return a.id === b.id && ContractAddress.equals(a.contract, b.contract);
    }

    return a === b;
};

type BalanceType = 'total' | 'available';

const balanceAtomFamily = atomFamily(
    ([account, balanceType, tokenAddress]: [AccountInfo, BalanceType, CIS2.TokenAddress | null, number]) => {
        if (tokenAddress === null) {
            return atom(
                balanceType === 'available'
                    ? account.accountAvailableBalance.microCcdAmount
                    : account.accountAmount.microCcdAmount
            );
        }

        if (tokenAddress.contract.index.toString() === PLT) {
            return atom((get) => {
                const latestAccountInfo = get(accountInfoFamily(account.accountAddress.address));
                const tokenState = latestAccountInfo?.accountTokens.find(
                    (accountToken) => accountToken.id.toString() === tokenAddress.id
                )?.state;

                if (balanceType === 'available' && tokenState?.moduleState) {
                    const accountModuleState = Cbor.decode(
                        Cbor.fromHexString(tokenState.moduleState.toString())
                    ) as TokenModuleAccountState;

                    return accountModuleState.available?.value ?? tokenState.balance.value;
                }

                return tokenState?.balance.value;
            });
        }

        const tokens = contractBalancesFamily(account.accountAddress.address, tokenAddress.contract.index.toString());
        return selectAtom(tokens, (ts) => ts[tokenAddress.id]);
    },
    // We compare the timestamp passed to ensure token balance is refreshed.
    ([aa, ba, ta, da], [ab, bb, tb, db]) =>
        AccountAddress.equals(aa.accountAddress, ab.accountAddress) && ba === bb && tokenAddressEq(ta, tb) && da === db
);

type Props = Omit<TokenAmountViewProps, 'tokens' | 'accountTokens' | 'balance' | 'onSelectToken' | 'ccdBalance'> & {
    /** The account info of the account to take the amount from */
    accountInfo: AccountInfo;
    /** The type of balance to use. Defaults to 'available' */
    balanceType?: BalanceType;
};

/**
 * TokenAmount component renders a form for transferring tokens with an amount field and optionally a receiver field.
 *
 * @example
 * const formMethods = useForm<AmountReceiveForm>();
 * const tokens = [{
 *   id: '',
 *   contract: ContractAddress.create(1),
 *   metadata: { symbol: 'wETH', name: 'Wrapped Ether', decimals: 18 },
 * }];
 *
 * // Usage with token picker & receiver
 * <TokenAmount
 *   buttonMaxLabel="Max"
 *   fee={CcdAmount.fromMicroCcd(1000n)}
 *   form={formMethods}
 *   receiver
 * />
 *
 * // Usage with CCD token
 * const formMethods = useForm<AmountForm>();
 * <TokenAmount
 *   buttonMaxLabel="Max"
 *   fee={CcdAmount.fromMicroCcd(1000n)}
 *   form={formMethods}
 *   token="ccd"
 * />
 *
 * // Usage with CIS2 token + receiver
 * const formMethods = useForm<AmountReceiveForm>();
 * <TokenAmount
 *   buttonMaxLabel="Max"
 *   fee={CcdAmount.fromMicroCcd(1000n)}
 *   form={formMethods}
 *   receiver
 *   token="cis2"
 *   address={{ id: '', contract: ContractAddress.create(1) }}
 * />
 */
export default function TokenAmount({ accountInfo, balanceType = 'available', ...props }: Props) {
    const { current: timestamp } = useRef(Date.now());
    const { token } = props.form.watch();
    const tokenAddress =
        (token?.tokenType === 'cis2' && token.tokenAddress) ||
        (token?.tokenType === 'plt' &&
            ({
                id: token.tokenSymbol,
                contract: { index: PLT, subindex: 0n },
            } as unknown as CIS2.TokenAddress)) ||
        null;

    const tokenInfo = useTokenInfo(accountInfo.accountAddress);
    const tokenBalance = useAtomValue(balanceAtomFamily([accountInfo, balanceType, tokenAddress, timestamp]));

    if (tokenInfo.loading) {
        return null;
    }

    return (
        <TokenAmountView
            {...(props as TokenAmountViewProps)}
            tokens={tokenInfo.value}
            balance={tokenBalance}
            ccdBalance={accountInfo.accountAvailableBalance}
        />
    );
}
