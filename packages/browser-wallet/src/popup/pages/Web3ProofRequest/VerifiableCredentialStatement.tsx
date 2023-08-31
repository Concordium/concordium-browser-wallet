import { RevealStatementV2, StatementTypes, VerifiableCredentialStatement } from '@concordium/web-sdk';
import Img from '@popup/shared/Img';
import { storedVerifiableCredentialSchemasAtom } from '@popup/store/verifiable-credential';
import { VerifiableCredential } from '@shared/storage/types';
import { useAtomValue } from 'jotai';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCredentialLocalization, useCredentialMetadata } from '../VerifiableCredential/VerifiableCredentialHooks';
import CredentialSelector from './CredentialSelector';
import { DisplayRevealStatements } from './Display/DisplayRevealStatements';
import { DisplaySecretStatements } from './Display/DisplaySecretStatements';
import { createWeb3IdDIDFromCredential, DisplayCredentialStatementProps, SecretStatementV2 } from './utils';

export function DisplayVC({ option }: { option: VerifiableCredential }) {
    const metadata = useCredentialMetadata(option);

    if (!metadata) {
        return null;
    }

    return (
        <header className="verifiable-credential__header">
            <div style={{ backgroundColor: metadata.backgroundColor }} className="web3-id-proof-request__selector-icon">
                <Img className="web3-id-proof-request__selector-icon-image" src={metadata.logo.url} withDefaults />
            </div>
            <div className="web3-id-proof-request__selector-title display5">{metadata.title}</div>
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
    const { t } = useTranslation('web3IdProofRequest');
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
            <p className="web3-id-proof-request__description bodyM">{t('descriptions.verifiableCredential')}</p>
            <CredentialSelector<VerifiableCredential>
                options={validCredentials}
                DisplayOption={DisplayVC}
                onChange={onChange}
                header={t('select.verifiableCredential')}
            />
            {reveals.length !== 0 && (
                <DisplayRevealStatements
                    className="web3-id-proof-request__statement"
                    dappName={dappName}
                    attributes={chosenCredential.credentialSubject.attributes}
                    statements={reveals}
                    schema={schema.properties.credentialSubject}
                />
            )}
            {secrets.length !== 0 && (
                <DisplaySecretStatements
                    className="web3-id-proof-request__statement"
                    attributes={chosenCredential.credentialSubject.attributes}
                    statements={secrets}
                    schema={schema.properties.credentialSubject}
                />
            )}
        </div>
    );
}
