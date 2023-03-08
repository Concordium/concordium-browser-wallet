import React, { useContext, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, Route, Routes, useNavigate } from 'react-router-dom';
import {
    AccountTransactionType,
    ChainParametersV1,
    isBakerAccount,
    isChainParametersV1,
    isDelegatorAccount,
    isRewardStatusV1,
} from '@concordium/web-sdk';

import Button from '@popup/shared/Button';
import { ensureDefined } from '@shared/utils/basic-helpers';
import { useSelectedAccountInfo } from '@popup/shared/AccountInfoListenerContext/AccountInfoListenerContext';
import { useHasPendingTransaction } from '@popup/shared/utils/transaction-helpers';
import { useAtomValue } from 'jotai';
import { grpcClientAtom } from '@popup/store/settings';
import { displayAsCcd, useAsyncMemo } from 'wallet-common-helpers';
import ButtonGroup from '@popup/shared/ButtonGroup';
import { accountPageContext } from '../utils';
import Delegate from './Delegate';
import { filterType, EarnPageContext, earnPageContext } from './utils';

const routes = {
    delegate: 'delegate',
    baking: 'baking',
};

interface EarnProps {
    chainParameters?: ChainParametersV1;
}

const defaultBakingMinimumEquityCapital = 14000000000n;

function Earn({ chainParameters }: EarnProps) {
    const { t } = useTranslation('account', { keyPrefix: 'earn' });
    const accountInfo = ensureDefined(useSelectedAccountInfo(), 'Expected to find account info for selected account');
    const nav = useNavigate();

    const hasPendingDelegationTransaction = useHasPendingTransaction(AccountTransactionType.ConfigureDelegation);
    const hasPendingBakerTransaction = useHasPendingTransaction(AccountTransactionType.ConfigureBaker);

    useEffect(() => {
        if (isDelegatorAccount(accountInfo) || hasPendingDelegationTransaction) {
            nav(routes.delegate);
        } else if (isBakerAccount(accountInfo) || hasPendingBakerTransaction) {
            nav(routes.baking);
        }
    }, [accountInfo]);

    return (
        <div className="earn-page">
            <div>
                <h3 className="m-t-0 w-full text-center">{t('title')}</h3>
                <div>{t('description')}</div>
                <p className="white-space-break">
                    <strong>{t('bakingHeader')}</strong>
                    <br />
                    {t('bakingDescription', {
                        minAmount: displayAsCcd(
                            chainParameters?.minimumEquityCapital?.toString() || defaultBakingMinimumEquityCapital
                        ),
                    })}
                </p>
                <p className="white-space-break">
                    <strong>{t('delegateHeader')}</strong>
                    <br />
                    {t('delegateDescription')}
                </p>
            </div>
            <ButtonGroup>
                <Button className="p-h-10" as={Link} to={routes.delegate}>
                    {t('delegateCta')}
                </Button>
                <Button className="p-h-10" as={Link} to={routes.baking}>
                    {t('bakingCta')}
                </Button>
            </ButtonGroup>
        </div>
    );
}

export default function EarnRoutes() {
    const { setDetailsExpanded } = useContext(accountPageContext);

    const client = useAtomValue(grpcClientAtom);
    const chainParameters = useAsyncMemo(
        () => client.getBlockChainParameters().then(filterType(isChainParametersV1)),
        undefined,
        []
    );
    const consensusStatus = useAsyncMemo(() => client.getConsensusStatus(), undefined, []);
    const tokenomicsInfo = useAsyncMemo(
        () => client.getTokenomicsInfo().then(filterType(isRewardStatusV1)),
        undefined,
        []
    );

    useEffect(() => {
        setDetailsExpanded(false);
        return () => setDetailsExpanded(true);
    }, []);

    const context = useMemo<EarnPageContext>(
        () => ({ chainParameters, consensusStatus, tokenomicsInfo }),
        [consensusStatus, tokenomicsInfo, chainParameters]
    );

    return (
        <earnPageContext.Provider value={context}>
            <Routes>
                <Route index element={<Earn chainParameters={chainParameters} />} />
                <Route path={`${routes.delegate}/*`} element={<Delegate />} />
                <Route path={routes.baking} element={<>Baking details coming...</>} />
            </Routes>
        </earnPageContext.Provider>
    );
}
