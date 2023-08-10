import { fullscreenPromptContext } from '@popup/page-layouts/FullscreenPromptLayout';
import { selectedAccountAtom } from '@popup/store/account';
import { useAtom, useAtomValue } from 'jotai';
import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import ExternalRequestLayout from '@popup/page-layouts/ExternalRequestLayout';
import Button from '@popup/shared/Button';
import {
    sessionTemporaryVerifiableCredentialsAtom,
    storedVerifiableCredentialMetadataAtom,
    storedVerifiableCredentialsAtom,
    storedVerifiableCredentialSchemasAtom,
} from '@popup/store/verifiable-credential';
import { VerifiableCredentialStatus, VerifiableCredentialSchema } from '@shared/storage/types';
import { useAsyncMemo } from 'wallet-common-helpers';
import { useHdWallet } from '@popup/shared/utils/account-helpers';
import { displayUrl } from '@popup/shared/utils/string-helpers';
import {
    createCredentialId,
    createPublicKeyIdentifier,
    fetchCredentialMetadata,
    fetchCredentialSchema,
    getCredentialRegistryContractAddress,
} from '@shared/utils/verifiable-credential-helpers';
import { APIVerifiableCredential } from '@concordium/browser-wallet-api-helpers';
import { networkConfigurationAtom } from '@popup/store/settings';
import { MetadataUrl } from '@concordium/browser-wallet-api-helpers/lib/wallet-api-types';
import { VerifiableCredentialCard } from '../VerifiableCredential/VerifiableCredentialCard';

type Props = {
    onAllow(key: string): void;
    onReject(): void;
};

interface Location {
    state: {
        payload: {
            url: string;
            credential: APIVerifiableCredential;
            metadataUrl: MetadataUrl;
        };
    };
}

export default function AddWeb3IdCredential({ onAllow, onReject }: Props) {
    const { state } = useLocation() as Location;
    const { t } = useTranslation('addWeb3IdCredential');
    const { onClose, withClose } = useContext(fullscreenPromptContext);
    const selectedAccount = useAtomValue(selectedAccountAtom);
    const [acceptButtonDisabled, setAcceptButtonDisabled] = useState<boolean>(false);
    const [web3IdCredentials, setWeb3IdCredentials] = useAtom(sessionTemporaryVerifiableCredentialsAtom);
    const storedWeb3IdCredentials = useAtomValue(storedVerifiableCredentialsAtom);
    const [verifiableCredentialMetadata, setVerifiableCredentialMetadata] = useAtom(
        storedVerifiableCredentialMetadataAtom
    );
    const [schemas, setSchemas] = useAtom(storedVerifiableCredentialSchemasAtom);
    const wallet = useHdWallet();
    const network = useAtomValue(networkConfigurationAtom);

    const { credential, url, metadataUrl } = state.payload;

    useEffect(() => onClose(onReject), [onClose, onReject]);

    const controller = new AbortController();

    const metadata = useAsyncMemo(
        async () => {
            if (verifiableCredentialMetadata.loading) {
                return undefined;
            }
            if (metadataUrl.url in verifiableCredentialMetadata.value) {
                // TODO check hash?
                return verifiableCredentialMetadata.value[metadataUrl.url];
            }
            return fetchCredentialMetadata(metadataUrl, controller);
        },
        undefined,
        [verifiableCredentialMetadata.loading]
    );
    const schema = useAsyncMemo(
        async () => {
            if (schemas.loading) {
                return undefined;
            }
            const schemaUrl = credential.credentialSchema.id;
            if (schemaUrl in schemas.value) {
                // TODO check hash?
                return schemas.value[schemaUrl];
            }
            return fetchCredentialSchema(metadataUrl, controller);
        },
        undefined,
        [schemas.loading]
    );
    useEffect(() => () => controller.abort(), [metadataUrl]);

    async function addCredential(credentialSchema: VerifiableCredentialSchema) {
        if (!wallet) {
            throw new Error('Wallet is unexpectedly missing');
        }

        const schemaUrl = credential.credentialSchema.id;
        if (!Object.keys(schemas.value).includes(schemaUrl)) {
            const updatedSchemas = { ...schemas.value };
            updatedSchemas[schemaUrl] = credentialSchema;
            setSchemas(updatedSchemas);
        }
        // Find the next unused index
        // TODO verify index is unused on chain?
        const index = [...(web3IdCredentials || []), ...(storedWeb3IdCredentials || [])].reduce(
            (best, cred) => (cred.issuer === credential.issuer ? Math.max(cred.index + 1, best) : best),
            0
        );

        const issuer = getCredentialRegistryContractAddress(credential.issuer);

        const credentialHolderId = wallet.getVerifiableCredentialPublicKey(issuer, index).toString('hex');
        const credentialSubjectId = createPublicKeyIdentifier(credentialHolderId, network);
        const credentialSubject = { ...credential.credentialSubject, id: credentialSubjectId };

        const fullCredential = {
            ...credential,
            credentialSubject,
            id: createCredentialId(credentialHolderId, issuer, network),
            index,
        };
        await setWeb3IdCredentials([...(web3IdCredentials || []), fullCredential]);
        if (metadata) {
            const newMetadata = { ...verifiableCredentialMetadata.value };
            newMetadata[metadataUrl.url] = metadata;
            await setVerifiableCredentialMetadata(newMetadata);
        }
        return credentialSubjectId;
    }

    if (!selectedAccount || !schema || !wallet || !metadata) {
        // TODO: loading screen?
        return null;
    }

    const urlDisplay = displayUrl(url);
    return (
        <ExternalRequestLayout>
            <div className="flex-column h-full">
                <div>{t('description', { dapp: urlDisplay })}</div>
                <VerifiableCredentialCard
                    credentialSubject={credential.credentialSubject}
                    className="add-web3Id-credential__card"
                    schema={schema}
                    credentialStatus={VerifiableCredentialStatus.NotActivated}
                    metadata={metadata}
                />
                <div className="flex justify-center m-t-auto m-b-20">
                    <Button width="medium" className="m-r-10" onClick={withClose(onReject)}>
                        {t('reject')}
                    </Button>
                    <Button
                        width="medium"
                        disabled={acceptButtonDisabled}
                        onClick={() => {
                            setAcceptButtonDisabled(true);
                            addCredential(schema).then(withClose(onAllow));
                        }}
                    >
                        {t('accept')}
                    </Button>
                </div>
            </div>
        </ExternalRequestLayout>
    );
}
