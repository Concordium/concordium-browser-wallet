import {
    AccountCredentialStatement,
    createAccountDID,
    CredentialSchemaSubject,
    IDENTITY_SUBJECT_SCHEMA,
    RevealStatementV2,
    StatementTypes,
} from '@concordium/web-sdk';
import { displayNameOrSplitAddress, useIdentityName, useIdentityOf } from '@popup/shared/utils/account-helpers';
import { useDisplayAttributeValue } from '@popup/shared/utils/identity-helpers';
import { ConfirmedIdentity, WalletCredential } from '@shared/storage/types';
import { getCredentialIdFromSubjectDID } from '@shared/utils/verifiable-credential-helpers';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SecretStatement, useStatementName, useStatementValue } from '../IdProofRequest/DisplayStatement/utils';
import CredentialSelector from './CredentialSelector';
import { DisplayRevealStatements } from './Display/DisplayRevealStatements';
import { DisplaySecretStatements } from './Display/DisplaySecretStatements';
import { OverwriteSecretLine } from './Display/utils';
import { DisplayCredentialStatementProps, SecretStatementV2 } from './utils';

export function DisplayAccount({ option }: { option: WalletCredential }) {
    const identityName = useIdentityName(option);

    if (!identityName) {
        return null;
    }

    return (
        <header className="verifiable-credential__header">
            <div className="verifiable-presentation-request__selector-title flex-column align-start">
                <div className="display5">{displayNameOrSplitAddress(option)}</div>
                <div className="bodyS">{identityName}</div>
            </div>
        </header>
    );
}

export default function AccountStatement({
    credentialStatement,
    validCredentials,
    dappName,
    chosenId,
    setChosenId,
    net,
    showDescription,
}: DisplayCredentialStatementProps<AccountCredentialStatement, WalletCredential>) {
    const { t } = useTranslation('web3IdProofRequest');
    const reveals = credentialStatement.statement.filter(
        (s) => s.type === StatementTypes.RevealAttribute
    ) as RevealStatementV2[];
    const secrets = credentialStatement.statement.filter(
        (s) => s.type !== StatementTypes.RevealAttribute
    ) as SecretStatementV2[];
    const displayAttribute = useDisplayAttributeValue();

    const initialIndex = useMemo(
        () => validCredentials.findIndex((c) => c.credId === getCredentialIdFromSubjectDID(chosenId)),
        []
    );
    const [chosenCredential, setChosenCredential] = useState<WalletCredential | undefined>(
        validCredentials[initialIndex]
    );

    // We do the type cast, because the check should have been done to filter validCredentials.
    const identity = useIdentityOf(chosenCredential) as ConfirmedIdentity | undefined;

    const onChange = useCallback((credential: WalletCredential) => {
        setChosenCredential(credential);
        setChosenId(createAccountDID(net, credential.credId));
    }, []);

    const accountCreateSecretLine: OverwriteSecretLine = (statement: SecretStatementV2) => {
        const value = useStatementValue(statement as SecretStatement);
        const attribute = useStatementName(statement as SecretStatement);
        return {
            attribute,
            value,
        };
    };

    if (!identity) {
        return null;
    }

    return (
        <div className="verifiable-presentation-request__credential-statement-container">
            {showDescription && (
                <p className="verifiable-presentation-request__description bodyM">
                    {t('descriptions.accountCredential')}
                </p>
            )}
            <CredentialSelector<WalletCredential>
                options={validCredentials}
                initialIndex={initialIndex}
                DisplayOption={DisplayAccount}
                onChange={onChange}
                header={t('select.accountCredential')}
            />
            {reveals.length !== 0 && (
                <DisplayRevealStatements
                    className="verifiable-presentation-request__statement"
                    dappName={dappName}
                    attributes={identity.idObject.value.attributeList.chosenAttributes}
                    statements={reveals}
                    formatAttribute={displayAttribute}
                    schema={IDENTITY_SUBJECT_SCHEMA as CredentialSchemaSubject}
                />
            )}
            {secrets.length !== 0 && (
                <DisplaySecretStatements
                    className="verifiable-presentation-request__statement"
                    attributes={identity.idObject.value.attributeList.chosenAttributes}
                    statements={secrets}
                    formatAttribute={displayAttribute}
                    schema={IDENTITY_SUBJECT_SCHEMA as CredentialSchemaSubject}
                    overwriteSecretLine={accountCreateSecretLine}
                />
            )}
        </div>
    );
}
