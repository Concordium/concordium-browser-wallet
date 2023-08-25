import { fullscreenPromptContext } from '@popup/page-layouts/FullscreenPromptLayout';
import { useAtom, useAtomValue } from 'jotai';
import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import ExternalRequestLayout from '@popup/page-layouts/ExternalRequestLayout';
import Button from '@popup/shared/Button';
import {
    sessionTemporaryVerifiableCredentialMetadataUrlsAtom,
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
    fetchLocalization,
    getCredentialRegistryContractAddress,
} from '@shared/utils/verifiable-credential-helpers';
import { APIVerifiableCredential } from '@concordium/browser-wallet-api-helpers';
import { networkConfigurationAtom } from '@popup/store/settings';
import { MetadataUrl } from '@concordium/browser-wallet-api-helpers/lib/wallet-api-types';
import { parse } from '@shared/utils/payload-helpers';
import { VerifiableCredentialCard } from '../VerifiableCredential/VerifiableCredentialCard';

type Props = {
    onAllow(key: string): void;
    onReject(): void;
};

interface Location {
    state: {
        payload: {
            url: string;
            credential: string;
            metadataUrl: MetadataUrl;
        };
    };
}

export default function AddWeb3IdCredential({ onAllow, onReject }: Props) {
    const { state } = useLocation() as Location;
    const { t } = useTranslation('addWeb3IdCredential');
    const { i18n } = useTranslation();
    const { onClose, withClose } = useContext(fullscreenPromptContext);
    const [acceptButtonDisabled, setAcceptButtonDisabled] = useState<boolean>(false);
    const [web3IdCredentials, setWeb3IdCredentials] = useAtom(sessionTemporaryVerifiableCredentialsAtom);
    const [metadataUrls, setMetadataUrls] = useAtom(sessionTemporaryVerifiableCredentialMetadataUrlsAtom);
    const storedWeb3IdCredentials = useAtomValue(storedVerifiableCredentialsAtom);
    const [verifiableCredentialMetadata, setVerifiableCredentialMetadata] = useAtom(
        storedVerifiableCredentialMetadataAtom
    );
    const [schemas, setSchemas] = useAtom(storedVerifiableCredentialSchemasAtom);
    const wallet = useHdWallet();
    const network = useAtomValue(networkConfigurationAtom);

    const [error, setError] = useState<string>();

    const { credential: rawCredential, url, metadataUrl } = state.payload;
    const credential: APIVerifiableCredential = parse(rawCredential);

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
        () => setError(t('error.metadata')),
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
            return fetchCredentialSchema({ url: schemaUrl }, controller);
        },
        () => setError(t('error.schema')),
        [schemas.loading]
    );

    useEffect(() => {
        if (schema) {
            // Ensure that all attributes required by the schema are in the attributes. If not, then
            // the credential should not be allowed to be added.
            const missingRequiredAttributeKeys = [];
            const requiredAttributes = schema.properties.credentialSubject.properties.attributes.required;
            for (const requiredAttribute of requiredAttributes) {
                if (!Object.keys(credential.credentialSubject.attributes).includes(requiredAttribute)) {
                    missingRequiredAttributeKeys.push(requiredAttribute);
                }
            }

            if (missingRequiredAttributeKeys.length > 0) {
                setError(t('error.attribute', { attributeKeys: missingRequiredAttributeKeys }));
            }
        }
    }, [schema?.properties.credentialSubject.properties.attributes.required]);

    useEffect(() => () => controller.abort(), []);

    const localization = useAsyncMemo(
        async () => {
            if (metadata === undefined) {
                return undefined;
            }

            if (metadata.localization === undefined) {
                return undefined;
            }

            const currentLanguageLocalization = metadata.localization[i18n.language];
            if (currentLanguageLocalization === undefined) {
                return undefined;
            }

            return fetchLocalization(currentLanguageLocalization, controller);
        },
        () => setError('Failed to get localization'),
        [metadata, i18n]
    );

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
        const index = [...web3IdCredentials.value, ...storedWeb3IdCredentials.value].reduce(
            (best, cred) => (cred.issuer === credential.issuer ? Math.max(cred.index + 1, best) : best),
            0
        );

        const issuer = getCredentialRegistryContractAddress(credential.issuer);

        const credentialHolderId = wallet.getVerifiableCredentialPublicKey(issuer, index).toString('hex');
        const credentialSubjectId = createPublicKeyIdentifier(credentialHolderId, network);
        const credentialSubject = { ...credential.credentialSubject, id: credentialSubjectId };
        const credentialId = createCredentialId(credentialHolderId, issuer, network);

        const fullCredential = {
            ...credential,
            credentialSubject,
            id: credentialId,
            index,
        };
        await setWeb3IdCredentials([...web3IdCredentials.value, fullCredential]);
        if (metadata) {
            const newMetadata = { ...verifiableCredentialMetadata.value };
            newMetadata[metadataUrl.url] = metadata;
            await setVerifiableCredentialMetadata(newMetadata);
            await setMetadataUrls({ ...metadataUrls.value, [credentialId]: metadataUrl.url });
        }
        return credentialSubjectId;
    }

    if (web3IdCredentials.loading || storedWeb3IdCredentials.loading) {
        return null;
    }

    const urlDisplay = displayUrl(url);
    return (
        <ExternalRequestLayout>
            <div className="flex-column h-full">
                {error && (
                    <div className="add-web3Id-credential__error">
                        <p>{t('error.initial')}</p>
                        <p>{error}</p>
                    </div>
                )}
                {!error && schema && metadata && (
                    <>
                        <div>{t('description', { dapp: urlDisplay })}</div>
                        <VerifiableCredentialCard
                            credentialSubject={credential.credentialSubject}
                            className="add-web3Id-credential__card"
                            schema={schema}
                            credentialStatus={VerifiableCredentialStatus.NotActivated}
                            metadata={metadata}
                            localization={localization}
                        />
                    </>
                )}
                <div className="flex justify-center m-t-auto m-b-20">
                    <Button width="medium" className="m-r-10" onClick={withClose(onReject)}>
                        {t('reject')}
                    </Button>
                    <Button
                        width="medium"
                        disabled={acceptButtonDisabled || !schema || Boolean(error)}
                        onClick={() => {
                            if (schema) {
                                setAcceptButtonDisabled(true);
                                addCredential(schema).then(withClose(onAllow));
                            }
                        }}
                    >
                        {t('accept')}
                    </Button>
                </div>
            </div>
        </ExternalRequestLayout>
    );
}
