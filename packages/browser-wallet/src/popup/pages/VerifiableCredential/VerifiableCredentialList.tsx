import React, { useEffect, useState } from 'react';
import {
    storedVerifiableCredentialMetadataAtom,
    storedVerifiableCredentialSchemasAtom,
    storedVerifiableCredentialsAtom,
} from '@popup/store/verifiable-credential';
import { useAtom, useAtomValue } from 'jotai';
import {
    MetadataUrl,
    VerifiableCredential,
    VerifiableCredentialSchema,
    VerifiableCredentialStatus,
} from '@shared/storage/types';
import {
    VerifiableCredentialMetadata,
    getCredentialHolderId,
    getCredentialMetadata,
    getCredentialRegistryContractAddress,
    getCredentialRegistryMetadata,
    getCredentialSchema,
    getVerifiableCredentialEntry,
} from '@shared/utils/verifiable-credential-helpers';
import { grpcClientAtom } from '@popup/store/settings';
import { ConcordiumGRPCClient, ContractAddress } from '@concordium/web-sdk';
import { useCredentialMetadata, useCredentialSchema, useCredentialStatus } from './VerifiableCredentialHooks';
import { VerifiableCredentialCard } from './VerifiableCredentialCard';

/**
 * Component to display when there are no verifiable credentials in the wallet.
 */
function NoVerifiableCredentials() {
    return (
        <div className="flex-column align-center h-full">
            <p className="m-t-20 m-h-30">You do not have any verifiable credentials in your wallet.</p>
        </div>
    );
}

function VerifiableCredentialCardWithStatusFromChain({
    credential,
    onClick,
}: {
    credential: VerifiableCredential;
    onClick?: (
        status: VerifiableCredentialStatus,
        schema: VerifiableCredentialSchema,
        metadata: VerifiableCredentialMetadata
    ) => void;
}) {
    const status = useCredentialStatus(credential);
    const schema = useCredentialSchema(credential);
    const metadata = useCredentialMetadata(credential);

    // TODO Improve this so that a card can render without a schema in some temporary
    // shape or form (e.g. an empty card, or just the raw attributes)
    if (!schema || !metadata) {
        return null;
    }

    return (
        <VerifiableCredentialCard
            credential={credential}
            schema={schema}
            onClick={() => {
                if (onClick) {
                    onClick(status, schema, metadata);
                }
            }}
            credentialStatus={status}
            metadata={metadata}
        />
    );
}

/**
 * Finds all the unique contract addresses for the issuers in a list of
 * verifiable credentials, i.e. taking all the contract addresses and removing
 * any duplicates.
 * @param verifiableCredentials the credentials to find the contract addresses for
 */
function findIssuerContractAddresses(verifiableCredentials: VerifiableCredential[]) {
    const allContractAddresses = verifiableCredentials.map((vc) => getCredentialRegistryContractAddress(vc.id));
    return [...new Set(allContractAddresses)];
}

async function getCredentialSchemas(
    issuerContractAddresses: ContractAddress[],
    abortControllers: AbortController[],
    client: ConcordiumGRPCClient
) {
    const onChainSchemas: VerifiableCredentialSchema[] = [];

    for (const contractAddress of issuerContractAddresses) {
        const registryMetadata = await getCredentialRegistryMetadata(client, contractAddress);

        if (registryMetadata) {
            const controller = new AbortController();
            abortControllers.push(controller);
            try {
                const credentialSchema = await getCredentialSchema(
                    registryMetadata.credentialSchema.schema,
                    controller
                );
                onChainSchemas.push(credentialSchema);
            } catch {
                // TODO An error is thrown here if the controller aborts which can be ignored.
                // TODO An error can also be thrown if the fetching of the credential schema goes haywire.
            }
        }
    }

    return onChainSchemas;
}

async function getCredentialMetadataBulk(
    client: ConcordiumGRPCClient,
    credentials: VerifiableCredential[],
    abortControllers: AbortController[]
) {
    const metadataUrls: MetadataUrl[] = [];
    for (const vc of credentials) {
        const entry = await getVerifiableCredentialEntry(
            client,
            getCredentialRegistryContractAddress(vc.id),
            getCredentialHolderId(vc.id)
        );
        if (entry) {
            metadataUrls.push(entry.credentialInfo.metadataUrl);
        }
    }
    const uniqueMetadataUrls = [...new Map(metadataUrls.map((item) => [item.url, item])).values()];

    const metadataList: { metadata: VerifiableCredentialMetadata; url: string }[] = [];
    for (const metadataUrl of uniqueMetadataUrls) {
        const controller = new AbortController();
        abortControllers.push(controller);
        const metadata = await getCredentialMetadata(metadataUrl, controller);
        metadataList.push({ metadata, url: metadataUrl.url });
    }

    return metadataList;
}

/**
 * Renders all verifiable credentials that are in the wallet. The credentials
 * are selectable by clicking them, which will move the user to a view containing
 * a single credential.
 */
export default function VerifiableCredentialList() {
    const verifiableCredentials = useAtomValue(storedVerifiableCredentialsAtom);
    const [selected, setSelected] = useState<{
        credential: VerifiableCredential;
        status: VerifiableCredentialStatus;
        schema: VerifiableCredentialSchema;
        metadata: VerifiableCredentialMetadata;
    }>();
    const client = useAtomValue(grpcClientAtom);
    const [schemas, setSchemas] = useAtom(storedVerifiableCredentialSchemasAtom);
    const [storedMetadata, setStoredMetadata] = useAtom(storedVerifiableCredentialMetadataAtom);

    useEffect(() => {
        let isCancelled = false;
        const abortControllers: AbortController[] = [];

        if (verifiableCredentials && !storedMetadata.loading) {
            getCredentialMetadataBulk(client, verifiableCredentials, abortControllers).then((metadataList) => {
                let updatedStoredMetadata = { ...storedMetadata.value };

                // TODO Verify that something has actually changed before making the update.
                for (const updatedMetadata of metadataList) {
                    if (storedMetadata.value === undefined) {
                        updatedStoredMetadata = {
                            [updatedMetadata.url]: updatedMetadata.metadata,
                        };
                    } else {
                        updatedStoredMetadata[updatedMetadata.url] = updatedMetadata.metadata;
                    }
                }

                if (!isCancelled) {
                    setStoredMetadata(updatedStoredMetadata);
                }
            });
        }

        return () => {
            isCancelled = true;
            abortControllers.forEach((controller) => controller.abort());
        };
    }, [storedMetadata.loading, verifiableCredentials, client]);

    useEffect(() => {
        let isCancelled = false;
        const abortControllers: AbortController[] = [];

        if (verifiableCredentials) {
            const issuerContractAddresses = findIssuerContractAddresses(verifiableCredentials);

            if (!schemas.loading) {
                getCredentialSchemas(issuerContractAddresses, abortControllers, client).then((upToDateSchemas) => {
                    let updatedSchemasInStorage = { ...schemas.value };

                    // TODO Verify that something has actually changed before making the update.
                    for (const updatedSchema of upToDateSchemas) {
                        if (schemas.value === undefined) {
                            updatedSchemasInStorage = {
                                [updatedSchema.$id]: updatedSchema,
                            };
                        } else {
                            updatedSchemasInStorage[updatedSchema.$id] = updatedSchema;
                        }
                    }

                    if (!isCancelled) {
                        setSchemas(updatedSchemasInStorage);
                    }
                });
            }
        }

        return () => {
            isCancelled = true;
            abortControllers.forEach((controller) => controller.abort());
        };
    }, [schemas.loading, verifiableCredentials, client]);

    if (!verifiableCredentials || !verifiableCredentials.length) {
        return <NoVerifiableCredentials />;
    }

    if (selected) {
        return (
            <VerifiableCredentialCard
                credential={selected.credential}
                schema={selected.schema}
                credentialStatus={selected.status}
                metadata={selected.metadata}
            />
        );
    }

    return (
        <div className="verifiable-credential-list">
            {verifiableCredentials.map((credential, index) => {
                return (
                    <VerifiableCredentialCardWithStatusFromChain
                        // eslint-disable-next-line react/no-array-index-key
                        key={index}
                        credential={credential}
                        onClick={(
                            status: VerifiableCredentialStatus,
                            schema: VerifiableCredentialSchema,
                            metadata: VerifiableCredentialMetadata
                        ) => setSelected({ credential, status, schema, metadata })}
                    />
                );
            })}
        </div>
    );
}
