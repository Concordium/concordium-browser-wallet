import { MetadataUrl } from '@concordium/browser-wallet-api-helpers/lib/wallet-api-types';
import { RevealStatementV2, StatementTypes, VerifiableCredentialStatement } from '@concordium/web-sdk';
import Img from '@popup/shared/Img';
import { storedVerifiableCredentialSchemasAtom } from '@popup/store/verifiable-credential';
import { VerifiableCredential, VerifiableCredentialStatus } from '@shared/storage/types';
import { useAtomValue } from 'jotai';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { VerifiableCredentialCard } from '../VerifiableCredential/VerifiableCredentialCard';
import { useCredentialLocalization, useCredentialMetadata } from '../VerifiableCredential/VerifiableCredentialHooks';
import CredentialSelector from './CredentialSelector';
import { DisplayRevealStatements } from './Display/DisplayRevealStatements';
import { DisplaySecretStatements } from './Display/DisplaySecretStatements';
import { createWeb3IdDIDFromCredential, DisplayCredentialStatementProps, SecretStatementV2 } from './utils';

function Logo({ logo }: { logo: MetadataUrl }) {
    return <Img className="verifiable-credential__header__logo" src={logo.url} withDefaults />;
}

export function DisplayVC({ option }: { option: VerifiableCredential }) {
    const metadata = useCredentialMetadata(option);

    if (!metadata) {
        return null;
    }

    return (
        <header className="verifiable-credential__header">
            <Logo logo={metadata.logo} />
            <div className="verifiable-credential__header__title">{metadata.title}</div>
        </header>
    );
}

export default function DisplayWeb3Statement({
    credentialStatement,
    validCredentials,
    dappName,
    setChosenId,
    net,
}: DisplayCredentialStatementProps<VerifiableCredentialStatement, VerifiableCredential>) {
    const reveals = credentialStatement.statement.filter(
        (s) => s.type === StatementTypes.RevealAttribute
    ) as RevealStatementV2[];
    const secrets = credentialStatement.statement.filter(
        (s) => s.type !== StatementTypes.RevealAttribute
    ) as SecretStatementV2[];
    const verifiableCredentialSchemas = useAtomValue(storedVerifiableCredentialSchemasAtom);

    const [chosenCredential, setChosenCredential] = useState<VerifiableCredential | undefined>(validCredentials[0]);

    const onChange = useCallback((credential: VerifiableCredential) => {
        setChosenCredential(credential);
        setChosenId(createWeb3IdDIDFromCredential(credential, net));
    }, []);

    // Initially set chosenId
    useEffect(() => {
        if (chosenCredential) {
            setChosenId(createWeb3IdDIDFromCredential(chosenCredential, net));
        }
    }, []);

    const schema = useMemo(() => {
        if (!verifiableCredentialSchemas.loading && chosenCredential) {
            const schemaId = chosenCredential.credentialSchema.id;
            return verifiableCredentialSchemas.value[schemaId];
        }
        return null;
    }, [chosenCredential?.id, verifiableCredentialSchemas.loading]);

    const metadata = useCredentialMetadata(chosenCredential);
    const localization = useCredentialLocalization(chosenCredential);

    if (!chosenCredential || !schema || !metadata || localization.loading) {
        return null;
    }

    return (
        <div className="web3-id-proof-request__credential-statement-container">
            <VerifiableCredentialCard
                credentialSubject={chosenCredential.credentialSubject}
                schema={schema}
                credentialStatus={VerifiableCredentialStatus.Active}
                metadata={metadata}
                localization={localization.result}
            />
            <CredentialSelector<VerifiableCredential>
                options={validCredentials}
                DisplayOption={DisplayVC}
                onChange={onChange}
            />
            {reveals.length !== 0 && (
                <DisplayRevealStatements
                    className="m-t-10:not-first"
                    dappName={dappName}
                    attributes={chosenCredential.credentialSubject.attributes}
                    statements={reveals}
                    schema={schema}
                />
            )}
            {secrets.length !== 0 && (
                <DisplaySecretStatements
                    className="m-t-10:not-first"
                    attributes={chosenCredential.credentialSubject.attributes}
                    statements={secrets}
                    schema={schema}
                />
            )}
        </div>
    );
}
