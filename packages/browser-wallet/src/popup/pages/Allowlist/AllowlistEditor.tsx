import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '@popup/shared/Button/Button';
import { selectedAccountAtom, storedAllowlistAtom } from '@popup/store/account';
import { useAtom, useAtomValue } from 'jotai';
import { useTranslation } from 'react-i18next';
import { popupMessageHandler } from '@popup/shared/message-handler';
import { EventType } from '@concordium/browser-wallet-api-helpers';
import Modal from '@popup/shared/Modal/Modal';
import ButtonGroup from '@popup/shared/ButtonGroup';
import AllowlistEntryView, { AllowlistMode } from './AllowlistEntryView';
import { handleAllowlistEntryUpdate } from './util';

function LoadingAllowlistEditor() {
    return <div className="allow-list-editor" />;
}

export default function AllowlistEditor() {
    const nav = useNavigate();
    const { t } = useTranslation('allowlist', { keyPrefix: 'editor' });
    const [showPrompt, setShowPrompt] = useState(false);
    const { serviceName } = useParams<{ serviceName: string }>();
    const [allowListLoading, setAllowList] = useAtom(storedAllowlistAtom);
    const selectedAccount = useAtomValue(selectedAccountAtom);

    if (!serviceName) {
        throw new Error('Invalid URL - the service name should be part of the URL.');
    }

    const decodedServiceName = decodeURIComponent(serviceName);

    async function removeService(serviceNameToRemove: string, allowlist: Record<string, string[]>) {
        const updatedAllowlist = { ...allowlist };
        const disconnectedAccounts = [...updatedAllowlist[serviceNameToRemove]];
        delete updatedAllowlist[serviceNameToRemove];
        await setAllowList(updatedAllowlist);

        for (const account of disconnectedAccounts) {
            popupMessageHandler.broadcastToUrl(EventType.AccountDisconnected, serviceNameToRemove, account);
        }
    }

    if (allowListLoading.loading) {
        return <LoadingAllowlistEditor />;
    }

    const trigger = (
        <Button clear className="allow-list-editor__remove-button">
            <h3>{t('removeButton')}</h3>
        </Button>
    );

    return (
        <div className="allow-list-editor">
            <AllowlistEntryView
                initialSelectedAccounts={allowListLoading.value[decodedServiceName]}
                mode={AllowlistMode.Modify}
                onChange={(accounts) =>
                    handleAllowlistEntryUpdate(
                        decodedServiceName,
                        allowListLoading.value,
                        accounts,
                        setAllowList,
                        selectedAccount
                    )
                }
            />
            <div className="flex p-b-10 m-t-auto">
                <Modal
                    trigger={trigger}
                    open={showPrompt}
                    onOpen={() => setShowPrompt(true)}
                    onClose={() => setShowPrompt(false)}
                    disableClose
                >
                    <h3 className="m-t-0">{t('modal.header')}</h3>
                    <p className="m-b-20">{t('modal.description')}</p>
                    <ButtonGroup>
                        <Button faded onClick={() => setShowPrompt(false)}>
                            {t('modal.keep')}
                        </Button>
                        <Button
                            danger
                            onClick={() =>
                                removeService(decodedServiceName, allowListLoading.value).then(() => nav(-1))
                            }
                        >
                            {t('modal.remove')}
                        </Button>
                    </ButtonGroup>
                </Modal>
            </div>
        </div>
    );
}
