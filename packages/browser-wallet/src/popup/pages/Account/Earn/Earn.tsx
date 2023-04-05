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
import { displayAsCcd, useAsyncMemo, useUpdateEffect } from 'wallet-common-helpers';
import ButtonGroup from '@popup/shared/ButtonGroup';
import { selectedAccountAtom } from '@popup/store/account';
import { absoluteRoutes } from '@popup/constants/routes';
import { useBlockChainParameters } from '@popup/shared/BlockChainParametersProvider';
import Baking from './Baking';
import Delegate from './Delegate';
import { accountPageContext } from '../utils';
import { filterType, EarnPageContext, earnPageContext } from './utils';
import { accountRoutes } from '../routes';

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
    const account = useAtomValue(selectedAccountAtom);
    const nav = useNavigate();

    useUpdateEffect(() => {
        nav(`${absoluteRoutes.home.account.path}/${accountRoutes.earn}`);
    }, [account]);

    const client = useAtomValue(grpcClientAtom);
    const chainParameters = useBlockChainParameters();
    const ParametersV1 = chainParameters ? filterType(isChainParametersV1)(chainParameters) : undefined;

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
        () => ({ chainParameters: ParametersV1, consensusStatus, tokenomicsInfo }),
        [consensusStatus, tokenomicsInfo, chainParameters]
    );

    return (
        <earnPageContext.Provider value={context}>
            <Routes>
                <Route index element={<Earn chainParameters={ParametersV1} />} />
                <Route path={`${routes.delegate}/*`} element={<Delegate />} />
                <Route path={`${routes.baking}/*`} element={<Baking />} />
            </Routes>
        </earnPageContext.Provider>
    );
}