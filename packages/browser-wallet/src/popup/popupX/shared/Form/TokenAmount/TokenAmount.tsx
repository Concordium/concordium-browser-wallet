import React, { useRef } from 'react';
import { atomFamily, selectAtom, useAtomValue } from 'jotai/utils';
import { AccountAddress, AccountInfo, ContractAddress, CIS2 } from '@concordium/web-sdk';
import { atom } from 'jotai';

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

type CcdBalanceType = 'total' | 'available';

const balanceAtomFamily = atomFamily(
    ([account, ccdBalance, tokenAddress]: [AccountInfo, CcdBalanceType, CIS2.TokenAddress | null, number]) => {
        if (tokenAddress === null) {
            return atom(
                ccdBalance === 'available'
                    ? account.accountAvailableBalance.microCcdAmount
                    : account.accountAmount.microCcdAmount
            );
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
    /** The ccd balance to use. Defaults to 'available' */
    ccdBalance?: CcdBalanceType;
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
export default function TokenAmount({ accountInfo, ccdBalance = 'available', ...props }: Props) {
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
    const cis2Balance = useAtomValue(balanceAtomFamily([accountInfo, ccdBalance, tokenAddress, timestamp]));

    if (tokenInfo.loading) {
        return null;
    }

    return (
        <TokenAmountView
            {...(props as TokenAmountViewProps)}
            tokens={tokenInfo.value}
            balance={cis2Balance}
            ccdBalance={accountInfo.accountAvailableBalance}
        />
    );
}
