import React, { useEffect, useState } from 'react';
import {
    storedVerifiableCredentialSchemasAtom,
    storedVerifiableCredentialsAtom,
} from '@popup/store/verifiable-credential';
import { useAtom, useAtomValue } from 'jotai';
import { VerifiableCredential, VerifiableCredentialSchema, VerifiableCredentialStatus } from '@shared/storage/types';
import {
    getCredentialRegistryContractAddress,
    getCredentialRegistryMetadata,
    getCredentialSchema,
} from '@shared/utils/verifiable-credential-helpers';
import { grpcClientAtom } from '@popup/store/settings';
import { ConcordiumGRPCClient, ContractAddress } from '@concordium/web-sdk';
import { useCredentialSchema, useCredentialStatus } from './VerifiableCredentialHooks';
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
    onClick?: (status: VerifiableCredentialStatus, schema: VerifiableCredentialSchema) => void;
}) {
    const status = useCredentialStatus(credential);
    const schema = useCredentialSchema(credential);

    // TODO Improve this so that a card can render without a schema in some temporary
    // shape or form (e.g. an empty card, or just the raw attributes)
    if (!schema) {
        return null;
    }

    return (
        <VerifiableCredentialCard
            credential={credential}
            schema={schema}
            onClick={() => {
                if (onClick) {
                    onClick(status, schema);
                }
            }}
            credentialStatus={status}
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
    }>();
    const client = useAtomValue(grpcClientAtom);
    const [schemas, setSchemas] = useAtom(storedVerifiableCredentialSchemasAtom);

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
                        onClick={(status: VerifiableCredentialStatus, schema: VerifiableCredentialSchema) =>
                            setSelected({ credential, status, schema })
                        }
                    />
                );
            })}
        </div>
    );
}
