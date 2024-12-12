import { RevealStatementV2, StatementTypes, VerifiableCredentialStatement } from '@concordium/web-sdk';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import Img from '@popup/shared/Img';
import { VerifiableCredential } from '@shared/storage/types';
import {
    useCredentialLocalization,
    useCredentialMetadata,
    useCredentialSchema,
} from '@popup/popupX/shared/utils/verifiable-credentials';

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
            <div
                style={{ backgroundColor: metadata.backgroundColor }}
                className="verifiable-presentation-request__selector-icon"
            >
                <Img
                    className="verifiable-presentation-request__selector-icon-image"
                    src={metadata.logo.url}
                    withDefaults
                />
            </div>
            <div className="verifiable-presentation-request__selector-title display5">{metadata.title}</div>
        </header>
    );
}

export default function DisplayWeb3Statement({
    credentialStatement,
    validCredentials,
    dappName,
    chosenId,
    setChosenId,
    net,
    showDescription,
}: DisplayCredentialStatementProps<VerifiableCredentialStatement, VerifiableCredential>) {
    const { t } = useTranslation('web3IdProofRequest');
    const reveals = credentialStatement.statement.filter(
        (s) => s.type === StatementTypes.RevealAttribute
    ) as RevealStatementV2[];
    const secrets = credentialStatement.statement.filter(
        (s) => s.type !== StatementTypes.RevealAttribute
    ) as SecretStatementV2[];

    const initialIndex = useMemo(() => validCredentials.findIndex((c) => c.id === chosenId), []);
    const [chosenCredential, setChosenCredential] = useState<VerifiableCredential | undefined>(
        validCredentials[initialIndex]
    );

    const onChange = useCallback((credential: VerifiableCredential) => {
        setChosenCredential(credential);
        setChosenId(createWeb3IdDIDFromCredential(credential, net));
    }, []);

    const schema = useCredentialSchema(chosenCredential);
    const metadata = useCredentialMetadata(chosenCredential);
    const localization = useCredentialLocalization(chosenCredential);

    if (!chosenCredential || !schema || !metadata || localization.loading) {
        return null;
    }

    return (
        <div className="verifiable-presentation-request__credential-statement-container">
            {showDescription && (
                <p className="verifiable-presentation-request__description bodyM">
                    {t('descriptions.verifiableCredential')}
                </p>
            )}
            <CredentialSelector<VerifiableCredential>
                options={validCredentials}
                DisplayOption={DisplayVC}
                onChange={onChange}
                header={t('select.verifiableCredential')}
                initialIndex={initialIndex}
            />
            {reveals.length !== 0 && (
                <DisplayRevealStatements
                    className="verifiable-presentation-request__statement"
                    dappName={dappName}
                    attributes={chosenCredential.credentialSubject.attributes}
                    statements={reveals}
                    schema={schema.properties.credentialSubject}
                />
            )}
            {secrets.length !== 0 && (
                <DisplaySecretStatements
                    className="verifiable-presentation-request__statement"
                    attributes={chosenCredential.credentialSubject.attributes}
                    statements={secrets}
                    schema={schema.properties.credentialSubject}
                />
            )}
        </div>
    );
}
