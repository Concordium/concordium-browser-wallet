import {
    AccountCredentialStatement,
    createAccountDID,
    CredentialSchemaSubject,
    IDENTITY_SUBJECT_SCHEMA,
    RevealStatementV2,
    StatementTypes,
} from '@concordium/web-sdk';
import { displaySplitAddress, useIdentityName, useIdentityOf } from '@popup/shared/utils/account-helpers';
import { useDisplayAttributeValue } from '@popup/shared/utils/identity-helpers';
import { ConfirmedIdentity, WalletCredential } from '@shared/storage/types';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import CredentialSelector from './CredentialSelector';
import { DisplayRevealStatements } from './Display/DisplayRevealStatements';
import { DisplaySecretStatements } from './Display/DisplaySecretStatements';
import { DisplayCredentialStatementProps, SecretStatementV2 } from './utils';

export function DisplayAccount({ option }: { option: WalletCredential }) {
    const identityName = useIdentityName(option);

    if (!identityName) {
        return null;
    }

    return (
        <header className="verifiable-credential__header">
            <div className="web3-id-proof-request__selector-title flex-column align-start">
                <div className="display5">{displaySplitAddress(option.address)}</div>
                <div className="bodyS">{identityName}</div>
            </div>
        </header>
    );
}

export default function AccountStatement({
    credentialStatement,
    validCredentials,
    dappName,
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

    const [chosenCredential, setChosenCredential] = useState<WalletCredential | undefined>(validCredentials[0]);
    // We do the type cast, because the check should have been done to filter validCredentials.
    const identity = useIdentityOf(chosenCredential) as ConfirmedIdentity | undefined;

    const onChange = useCallback((credential: WalletCredential) => {
        setChosenCredential(credential);
        setChosenId(createAccountDID(net, credential.credId));
    }, []);

    // Initially set chosenId
    useEffect(() => {
        if (chosenCredential) {
            setChosenId(createAccountDID(net, chosenCredential.credId));
        }
    }, []);

    if (!identity) {
        return null;
    }

    return (
        <div className="web3-id-proof-request__credential-statement-container">
            {showDescription && (
                <p className="web3-id-proof-request__description bodyM">{t('descriptions.accountCredential')}</p>
            )}
            <CredentialSelector<WalletCredential>
                options={validCredentials}
                DisplayOption={DisplayAccount}
                onChange={onChange}
                header={t('select.accountCredential')}
            />
            {reveals.length !== 0 && (
                <DisplayRevealStatements
                    className="web3-id-proof-request__statement"
                    dappName={dappName}
                    attributes={identity.idObject.value.attributeList.chosenAttributes}
                    statements={reveals}
                    formatAttribute={displayAttribute}
                    schema={IDENTITY_SUBJECT_SCHEMA as CredentialSchemaSubject}
                />
            )}
            {secrets.length !== 0 && (
                <DisplaySecretStatements
                    className="web3-id-proof-request__statement"
                    attributes={identity.idObject.value.attributeList.chosenAttributes}
                    statements={secrets}
                    formatAttribute={displayAttribute}
                    schema={IDENTITY_SUBJECT_SCHEMA as CredentialSchemaSubject}
                />
            )}
        </div>
    );
}
