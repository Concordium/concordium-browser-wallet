import React, { useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, Route, Routes, useNavigate } from 'react-router-dom';
import { isBakerAccount, isDelegatorAccount } from '@concordium/web-sdk';

import Button from '@popup/shared/Button';
import { ensureDefined } from '@shared/utils/basic-helpers';
import { useSelectedAccountInfo } from '@popup/shared/AccountInfoListenerContext/AccountInfoListenerContext';
import Delegate from './Delegate';
import { accountPageContext } from '../utils';

const routes = {
    delegate: 'delegate',
    baking: 'baking',
};

function Earn() {
    const { t } = useTranslation('account', { keyPrefix: 'earn' });

    return (
        <div className="earn-page">
            <div>
                <h3 className="m-t-0 w-full text-center">{t('title')}</h3>
                <div>{t('description')}</div>
                <p className="white-space-break">
                    <strong>{t('bakingHeader')}</strong>
                    <br />
                    {t('bakingDescription', { minAmount: '14000' })} {/* TODO: get from chain parameters */}
                </p>
                <p className="white-space-break">
                    <strong>{t('delegateHeader')}</strong>
                    <br />
                    {t('delegateDescription')}
                </p>
            </div>
            <div>
                <Button className="m-t-20" width="wide" as={Link} to={routes.delegate}>
                    {t('delegateCta')}
                </Button>
            </div>
        </div>
    );
}

export default function EarnRoutes() {
    const { setDetailsExpanded } = useContext(accountPageContext);
    const accountInfo = ensureDefined(useSelectedAccountInfo(), 'Expected to find account info for selected account');
    const nav = useNavigate();

    useEffect(() => {
        setDetailsExpanded(false);
        return () => setDetailsExpanded(true);
    }, []);

    useEffect(() => {
        if (isDelegatorAccount(accountInfo)) {
            nav(routes.delegate);
        } else if (isBakerAccount(accountInfo)) {
            nav(routes.baking);
        }
    }, [accountInfo]);

    return (
        <Routes>
            <Route index element={<Earn />} />
            <Route path={`${routes.delegate}/*`} element={<Delegate />} />
            <Route path={routes.baking} element={<>Baking details coming...</>} />
        </Routes>
    );
}
