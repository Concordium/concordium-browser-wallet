import React, { useEffect, useState } from 'react';
import Button from '@popup/popupX/shared/Button';
import { useNavigate } from 'react-router-dom';
import { absoluteRoutes } from '@popup/popupX/constants/routes';
import { useTranslation } from 'react-i18next';
import Page from '@popup/popupX/shared/Page';
import Text from '@popup/popupX/shared/Text';
import { getPublicKey } from '@popup/shared/utils/ledger-helpers';
import { selectedIdentityAtom } from '@popup/store/identity';
import { useAtomValue } from 'jotai';

export default function ComparePublicKey() {
    const { t } = useTranslation('x', { keyPrefix: 'onboarding.comparePublicKey' });
    const nav = useNavigate();
    const navToNext = () => nav(absoluteRoutes.onboarding.setupPassword.createOrRestore.confirmLedgerInformation.path);

    const [publicKey, setPublicKey] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    const selectedIdentity = useAtomValue(selectedIdentityAtom);

    const fetchPublicKey = async () => {
        try {
            setLoading(true);
            setError(null);
            const key = await getPublicKey(selectedIdentity?.index ?? 0, selectedIdentity?.providerIndex ?? 0);
            const formattedKey = key.match(/.{1,16}/g)?.join('\n') || key;
            setPublicKey(formattedKey);
        } catch (err: unknown) {
            setError('Please check if your Ledger device is connected and the Concordium app is open.');
        } finally {
            setLoading(false);
        }
    };
    // d3fa2f8dec194557
    // 6bb12a703784da59
    // 74f128f66bafdcc0
    // 6fce40308d4fd058

    useEffect(() => {
        // Fetch the public key on page load
        fetchPublicKey();
    }, [selectedIdentity]);

    const renderContent = () => {
        if (loading) return 'Please confirm on your Ledger device.';
        if (error) {
            return (
                <>
                    <p>Error: {error}</p>
                    <Button.Main type="button" label="Retry" onClick={fetchPublicKey} />
                </>
            );
        }
        return `${publicKey}`;
    };
    return (
        <Page className="id-cards-info">
            <Page.Top heading={t('ids')} />
            <Page.Main>
                <Text.Capture>
                    {t('idDescription')}
                    <div style={{ marginTop: '20px', color: '#ffffff' }}>
                        <p>
                            <strong>Credentials:</strong> {selectedIdentity?.index ?? '0'}
                        </p>
                        <p>
                            <strong>Identity:</strong> {selectedIdentity?.providerIndex ?? '0'}
                        </p>
                    </div>
                    <div
                        style={{
                            width: '150px',
                            overflowWrap: 'break-word',
                            wordBreak: 'break-word',
                            whiteSpace: 'pre-wrap',
                            marginTop: '10px',
                            backgroundColor: '#414141',
                            borderRadius: '8px',
                            padding: '10px',
                            color: '#ffffff',
                            lineBreak: 'anywhere',
                        }}
                    >
                        {renderContent()}
                    </div>
                </Text.Capture>
            </Page.Main>
            <Page.Footer>
                <Button.Main type="button" label={t('continue')} onClick={navToNext} />
            </Page.Footer>
        </Page>
    );
}
