import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { useAsyncMemo } from 'wallet-common-helpers';
import { APIVerifiableCredential, MetadataUrl } from '@concordium/browser-wallet-api-helpers';
import { Schema, Validator } from 'jsonschema';

import {
    sessionTemporaryVerifiableCredentialMetadataUrlsAtom,
    sessionTemporaryVerifiableCredentialsAtom,
    storedVerifiableCredentialMetadataAtom,
    storedVerifiableCredentialsAtom,
    storedVerifiableCredentialSchemasAtom,
} from '@popup/store/verifiable-credential';
import { VerifiableCredentialStatus, VerifiableCredentialSchema } from '@shared/storage/types';
import { useHdWallet } from '@popup/shared/utils/account-helpers';
import { displayUrl } from '@popup/shared/utils/string-helpers';
import {
    coerceBigIntIntegerToNumber,
    createCredentialId,
    createPublicKeyIdentifier,
    fetchCredentialMetadata,
    fetchCredentialSchema,
    fetchLocalization,
    findNextUnusedVerifiableCredentialIndex,
    getCredentialRegistryContractAddress,
    withIdRemovedFromSchema,
} from '@shared/utils/verifiable-credential-helpers';
import { grpcClientAtom, networkConfigurationAtom } from '@popup/store/settings';
import { parse } from '@shared/utils/payload-helpers';
import { logError } from '@shared/utils/log-helpers';
import { addToastAtom } from '@popup/state';
import { Web3IdCardRaw } from '@popup/popupX/shared/Web3IdCard/Web3IdCard';
import Page from '@popup/popupX/shared/Page';
import Button from '@popup/popupX/shared/Button';
import { fullscreenPromptContext } from '@popup/popupX/page-layouts/FullscreenPromptLayout';

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
    const { t } = useTranslation('x', { keyPrefix: 'prompts.AddWeb3IdCredentialX' });
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
    const client = useAtomValue(grpcClientAtom);

    const [error, setError] = useState<string>();
    const addToast = useSetAtom(addToastAtom);
    const [validationComplete, setValidationComplete] = useState<boolean>(false);

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
        (e) => {
            setError(t('error.metadata'));
            logError(e);
        },
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
        (e) => {
            setError(t('error.schema'));
            logError(e);
        },
        [schemas.loading]
    );

    useEffect(() => {
        if (schema) {
            // Use the schema to validate the credential.
            const validator = new Validator();
            try {
                const schemaWithNoId = withIdRemovedFromSchema(schema);
                const validationResult = validator.validate(
                    { credentialSubject: credential.credentialSubject },
                    schemaWithNoId as unknown as Schema,
                    { preValidateProperty: coerceBigIntIntegerToNumber }
                );
                if (!validationResult.valid) {
                    setError(t('error.schemaValidation', { errors: validationResult.errors.toString() }));
                    setValidationComplete(true);
                    return;
                }
            } catch (e) {
                logError(e);
                setError(
                    t('error.schemaValidation', {
                        errors: 'An error occurred while attempting to validate credential.',
                    })
                );
                setValidationComplete(true);
                return;
            }

            // Ensure that a credential with more attributes than listed by the schema cannot be added.
            // The schema might not check this in the current iteration of schemas (additionalProperties: false).
            const schemaAttributes = Object.keys(schema.properties.credentialSubject.properties.attributes.properties);
            for (const credentialAttribute of Object.keys(credential.credentialSubject.attributes)) {
                if (!schemaAttributes.includes(credentialAttribute)) {
                    setError(t('error.attribute.additional', { credentialAttribute, schemaAttributes }));
                    setValidationComplete(true);
                    return;
                }
            }

            setValidationComplete(true);
        }
    }, [Boolean(schema)]);

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
        (e) => {
            setError(t('error.localization'));
            logError(e);
        },
        [metadata, i18n]
    );

    async function addCredential(credentialSchema: VerifiableCredentialSchema) {
        if (!wallet) {
            throw new Error('Wallet is unexpectedly missing');
        }

        // Find the next unused verifiable credential index, based on what we have stored locally.
        const index = [...web3IdCredentials.value, ...storedWeb3IdCredentials.value].reduce(
            (best, cred) => (cred.issuer === credential.issuer ? Math.max(cred.index + 1, best) : best),
            0
        );

        const issuer = getCredentialRegistryContractAddress(credential.issuer);
        // Check if the index has already been used in the contract on-chain, and use that to find
        // the next unused index based on that.
        let nextUnusedIndex: number;
        try {
            nextUnusedIndex = await findNextUnusedVerifiableCredentialIndex(client, index, issuer, wallet);
        } catch (e) {
            addToast(t('error.findingNextIndex'));
            logError(e);
            throw e;
        }

        const schemaUrl = credential.credentialSchema.id;
        if (!Object.keys(schemas.value).includes(schemaUrl)) {
            const updatedSchemas = { ...schemas.value };
            updatedSchemas[schemaUrl] = credentialSchema;
            setSchemas(updatedSchemas);
        }

        const credentialHolderId = wallet.getVerifiableCredentialPublicKey(issuer, nextUnusedIndex).toString('hex');
        const credentialSubjectId = createPublicKeyIdentifier(credentialHolderId, network);
        const credentialSubject = { ...credential.credentialSubject, id: credentialSubjectId };
        const credentialId = createCredentialId(credentialHolderId, issuer, network);

        const fullCredential = {
            ...credential,
            credentialSubject,
            id: credentialId,
            index: nextUnusedIndex,
            metadataUrl: metadataUrl.url,
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

    if (web3IdCredentials.loading || storedWeb3IdCredentials.loading || (!validationComplete && !error)) {
        return null;
    }

    const urlDisplay = displayUrl(url);

    return (
        <Page>
            <Page.Top heading={t('title')} />
            <Page.Main>
                {error && (
                    <div className="add-web3Id-credential-x__error">
                        {t('error.initial')}
                        <br />
                        {error}
                    </div>
                )}
                {!error && schema && metadata && (
                    <>
                        <div>{t('description', { dapp: urlDisplay })}</div>
                        <Web3IdCardRaw
                            attributes={credential.credentialSubject.attributes}
                            className="m-t-10"
                            schema={{ ...schema, usingFallback: false }}
                            status={VerifiableCredentialStatus.Pending}
                            metadata={metadata}
                            localization={localization}
                        />
                    </>
                )}
            </Page.Main>
            <Page.Footer>
                <Button.Main onClick={withClose(onReject)} label={t('reject')} />
                <Button.Main
                    disabled={acceptButtonDisabled || !schema || Boolean(error)}
                    onClick={() => {
                        if (schema) {
                            setAcceptButtonDisabled(true);
                            addCredential(schema)
                                .then(withClose(onAllow))
                                .catch(() => setAcceptButtonDisabled(false));
                        }
                    }}
                    label={t('accept')}
                />
            </Page.Footer>
        </Page>
    );
}
