import React, { useContext, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import {
    AccountTransactionType,
    ChainParameters,
    ChainParametersV0,
    isBakerAccount,
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
import { absoluteRoutes } from '@popup/constants/routes';
import { useBlockChainParametersAboveV0 } from '@popup/shared/BlockChainParametersProvider';
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
    chainParameters?: Exclude<ChainParameters, ChainParametersV0>;
}

const defaultBakingMinimumEquityCapital = 14000000000n;

function Earn({ chainParameters }: EarnProps) {
    const { t } = useTranslation('account', { keyPrefix: 'earn' });

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
                            chainParameters?.minimumEquityCapital?.microCcdAmount || defaultBakingMinimumEquityCapital
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
    const accountInfo = ensureDefined(useSelectedAccountInfo(), 'Expected to find account info for selected account');
    const nav = useNavigate();
    const hasPendingDelegationTransaction = useHasPendingTransaction(AccountTransactionType.ConfigureDelegation);
    const hasPendingBakerTransaction = useHasPendingTransaction(AccountTransactionType.ConfigureBaker);

    const location = useLocation();

    useEffect(() => {
        if (location.pathname === `${absoluteRoutes.home.account.path}/${accountRoutes.earn}`) {
            setDetailsExpanded(false);
            if (isDelegatorAccount(accountInfo) || hasPendingDelegationTransaction) {
                nav(routes.delegate);
            } else if (isBakerAccount(accountInfo) || hasPendingBakerTransaction) {
                nav(routes.baking);
            }
        }
    }, [location.pathname]);

    useUpdateEffect(() => {
        if (isDelegatorAccount(accountInfo) || hasPendingDelegationTransaction) {
            nav(routes.delegate);
        } else if (isBakerAccount(accountInfo) || hasPendingBakerTransaction) {
            nav(routes.baking);
        } else {
            nav(`${absoluteRoutes.home.account.path}/${accountRoutes.earn}`);
        }
    }, [accountInfo]);

    const client = useAtomValue(grpcClientAtom);
    const chainParameters = useBlockChainParametersAboveV0();

    const consensusStatus = useAsyncMemo(() => client.getConsensusStatus(), undefined, []);
    const tokenomicsInfo = useAsyncMemo(
        () => client.getTokenomicsInfo().then(filterType(isRewardStatusV1)),
        undefined,
        []
    );
    const context = useMemo<EarnPageContext>(
        () => ({ chainParameters, consensusStatus, tokenomicsInfo }),
        [consensusStatus, tokenomicsInfo, chainParameters]
    );

    return (
        <earnPageContext.Provider value={context}>
            <Routes>
                <Route index element={<Earn chainParameters={chainParameters} />} />
                <Route path={`${routes.delegate}/*`} element={<Delegate />} />
                <Route path={`${routes.baking}/*`} element={<Baking />} />
            </Routes>
        </earnPageContext.Provider>
    );
}
