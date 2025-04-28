import {
    AccountCredentialStatement,
    createAccountDID,
    CredentialSchemaSubject,
    IDENTITY_SUBJECT_SCHEMA,
    RevealStatementV2,
    StatementTypes,
} from '@concordium/web-sdk';

import Text from '@popup/popupX/shared/Text';
import { displayNameOrSplitAddress, useIdentityName, useIdentityOf } from '@popup/shared/utils/account-helpers';
import { useDisplayAttributeValue } from '@popup/shared/utils/identity-helpers';
import { ConfirmedIdentity, WalletCredential } from '@shared/storage/types';
import { getCredentialIdFromSubjectDID } from '@shared/utils/verifiable-credential-helpers';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SecretStatement, useStatementName, useStatementValue } from '../IdProofRequest/DisplayStatement/utils';
import CredentialSelector, { CredentialSelectorDisplayProps } from './CredentialSelector';
import { DisplayRevealStatements } from './Display/DisplayRevealStatements';
import { DisplaySecretStatements } from './Display/DisplaySecretStatements';
import { OverwriteSecretLine } from './Display/utils';
import { DisplayCredentialStatementProps, SecretStatementV2 } from './utils';

function DisplayAccount({ option }: CredentialSelectorDisplayProps<WalletCredential>) {
    const identityName = useIdentityName(option);

    if (!identityName) {
        return null;
    }

    return (
        <>
            {displayNameOrSplitAddress(option)} - {identityName}
        </>
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

    if (!identity || !chosenCredential) {
        return null;
    }

    return (
        <>
            {showDescription && <Text.Capture>{t('descriptions.accountCredential')}</Text.Capture>}
            <CredentialSelector<WalletCredential>
                options={validCredentials}
                Display={DisplayAccount}
                id={(cred) => cred.credId}
                onChange={onChange}
                value={chosenCredential}
            />
            {reveals.length !== 0 && (
                <DisplayRevealStatements
                    dappName={dappName}
                    attributes={identity.idObject.value.attributeList.chosenAttributes}
                    statements={reveals}
                    formatAttribute={displayAttribute}
                    schema={IDENTITY_SUBJECT_SCHEMA as CredentialSchemaSubject}
                />
            )}
            {secrets.length !== 0 && (
                <DisplaySecretStatements
                    attributes={identity.idObject.value.attributeList.chosenAttributes}
                    statements={secrets}
                    formatAttribute={displayAttribute}
                    schema={IDENTITY_SUBJECT_SCHEMA as CredentialSchemaSubject}
                    overwriteSecretLine={accountCreateSecretLine}
                />
            )}
        </>
    );
}
