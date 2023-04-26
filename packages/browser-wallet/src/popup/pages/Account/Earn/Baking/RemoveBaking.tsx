import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import Carousel from '@popup/shared/Carousel';
import { useTranslation } from 'react-i18next';
import { absoluteRoutes } from '@popup/constants/routes';
import { AccountTransactionType, CcdAmount } from '@concordium/web-sdk';
import Modal from '@popup/shared/Modal';
import Button from '@popup/shared/Button';
import { useBlockChainParametersV1 } from '@popup/shared/BlockChainParametersProvider';
import { secondsToDaysRoundedDown } from '@shared/utils/time-helpers';
import IntroPage from '../IntroPage';
import { ConfirmGenericTransferState } from '../../ConfirmGenericTransfer';
import { accountRoutes } from '../../routes';

export default function RemoveBaking() {
    const nav = useNavigate();
    const { t } = useTranslation('account');
    const { t: tShared } = useTranslation('shared');
    const { pathname } = useLocation();
    const [showModal, setShowModal] = useState<boolean>(false);
    const chainParameters = useBlockChainParametersV1();

    const goToConfirm = () => {
        const confirmTransferState: ConfirmGenericTransferState = {
            payload: {
                stake: new CcdAmount(0n),
            },
            type: AccountTransactionType.ConfigureBaker,
        };
        nav(pathname, { replace: true, state: true }); // Override current router entry with stateful version
        nav(`${absoluteRoutes.home.account.path}/${accountRoutes.confirmTransfer}`, {
            state: confirmTransferState,
        });
    };

    return (
        <>
            <Modal open={showModal} disableClose>
                <div>
                    <h3 className="m-t-0">{t('important')}</h3>
                    <p className="white-space-break ">
                        {t('delegate.remove.notice', {
                            cooldownPeriod: secondsToDaysRoundedDown(chainParameters?.delegatorCooldown),
                        })}
                    </p>
                    <Button className="m-t-10" width="wide" onClick={goToConfirm}>
                        {tShared('continue')}
                    </Button>
                    <Button className="m-t-10" width="wide" onClick={() => setShowModal(false)}>
                        {tShared('cancel')}
                    </Button>
                </div>
            </Modal>
            <Carousel withBackButton className="earn-carousel" onContinue={() => setShowModal(true)}>
                <IntroPage title={t('baking.removeIntro.1.title')}>{t('baking.removeIntro.1.body')}</IntroPage>
            </Carousel>
        </>
    );
}
