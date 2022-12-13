import Button from '@popup/shared/Button';
import React, { useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, Route, Routes } from 'react-router-dom';
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
                    {t('bakingDescription')}
                </p>
                <p className="white-space-break">
                    <strong>{t('delegateHeader')}</strong>
                    <br />
                    {t('delegateDescription')}
                </p>
            </div>
            <div>
                <Button className="w-full m-t-20" as={Link} to={routes.delegate}>
                    {t('delegateCta')}
                </Button>
            </div>
        </div>
    );
}

export default function EarnRoutes() {
    const { setDetailsExpanded } = useContext(accountPageContext);

    useEffect(() => {
        setDetailsExpanded(false);
        return () => setDetailsExpanded(true);
    }, []);

    return (
        <Routes>
            <Route index element={<Earn />} />
            <Route path={routes.delegate} element={<>Delegate</>} />
            {/* <Route path={routes.baking} element={<>Baking</>} /> */}
        </Routes>
    );
}
