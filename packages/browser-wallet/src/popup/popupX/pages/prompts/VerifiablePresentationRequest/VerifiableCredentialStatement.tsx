import { RevealStatementV2, StatementTypes, VerifiableCredentialStatement } from '@concordium/web-sdk';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { VerifiableCredential } from '@shared/storage/types';
import {
    useCredentialLocalization,
    useCredentialMetadata,
    useCredentialSchema,
} from '@popup/popupX/shared/utils/verifiable-credentials';

import CredentialSelector, { CredentialSelectorDisplayProps } from './CredentialSelector';
import { DisplayRevealStatements } from './Display/DisplayRevealStatements';
import { DisplaySecretStatements } from './Display/DisplaySecretStatements';
import { createWeb3IdDIDFromCredential, DisplayCredentialStatementProps, SecretStatementV2 } from './utils';

export function DisplayVC({ option }: CredentialSelectorDisplayProps<VerifiableCredential>) {
    const metadata = useCredentialMetadata(option);
    if (!metadata) {
        return null;
    }

    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{metadata.title}</>;
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
    const { t } = useTranslation('x', { keyPrefix: 'prompts.verifiablePresentationRequest' });
    const reveals = credentialStatement.statement.filter(
        (s) => s.type === StatementTypes.RevealAttribute
    ) as RevealStatementV2[];
    const secrets = credentialStatement.statement.filter(
        (s) => s.type !== StatementTypes.RevealAttribute
    ) as SecretStatementV2[];

    const [chosenCredential, setChosenCredential] = useState<VerifiableCredential | undefined>(
        validCredentials.find((c) => c.id === chosenId)
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
                value={chosenCredential}
                onChange={onChange}
                id={(vc) => vc.id}
                Display={DisplayVC}
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
