import {
    AccountCredentialStatement,
    createAccountDID,
    RevealStatementV2,
    StatementTypes,
    AttributeKey,
    AttributeList,
    IDENTITY_SUBJECT_SCHEMA,
} from '@concordium/web-sdk';
import { displaySplitAddress, useIdentityName, useIdentityOf } from '@popup/shared/utils/account-helpers';
import { useDisplayAttributeValue, useGetAttributeName } from '@popup/shared/utils/identity-helpers';
import { WalletCredential, ConfirmedIdentity } from '@shared/storage/types';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ClassName } from 'wallet-common-helpers';
import { DisplayStatementView, StatementLine } from '../IdProofRequest/DisplayStatement/DisplayStatement';
import CredentialSelector from './CredentialSelector';
import { DisplayCredentialStatementProps, SecretStatementV2 } from './utils';
import {
    isoToCountryName,
    SecretStatement,
    useStatementDescription,
    useStatementHeader,
    useStatementName,
    useStatementValue,
} from '../IdProofRequest/DisplayStatement/utils';
import { DisplayRevealStatements } from './Display/DisplayRevealStatements';
import { DisplaySecretStatements } from './Display/DisplaySecretStatements';

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

type DisplaySecretStatementV2Props = ClassName & {
    identity?: ConfirmedIdentity;
    dappName: string;
    statement: SecretStatementV2;
};

export function DisplaySecretStatementV2({ dappName, statement, identity, className }: DisplaySecretStatementV2Props) {
    const v1Statement: SecretStatement = statement as SecretStatement;
    const header = useStatementHeader(v1Statement);
    const value = useStatementValue(v1Statement);
    const description = useStatementDescription(v1Statement, identity);
    const attribute = useStatementName(v1Statement);

    const lines: StatementLine[] = [
        {
            attribute,
            value,
            isRequirementMet: identity !== undefined,
        },
    ];

    return (
        <DisplayStatementView
            lines={lines}
            dappName={dappName}
            header={header}
            description={description}
            className={className}
        />
    );
}

type DisplayRevealStatementV2Props = ClassName & {
    identity?: ConfirmedIdentity;
    dappName: string;
    statements: RevealStatementV2[];
};

export function DisplayRevealStatementV2({ dappName, statements, identity, className }: DisplayRevealStatementV2Props) {
    const { t, i18n } = useTranslation('idProofRequest', { keyPrefix: 'displayStatement' });
    const getAttributeName = useGetAttributeName();
    const displayAttribute = useDisplayAttributeValue();
    const header = t('headers.reveal');
    const attributes = identity
        ? identity.idObject.value.attributeList.chosenAttributes
        : ({} as AttributeList['chosenAttributes']);

    const lines: StatementLine[] = statements.map((s) => {
        const stringTag = s.attributeTag as AttributeKey;
        const raw = attributes[stringTag];
        let value = displayAttribute(stringTag, raw ?? '');

        if (value && ['countryOfResidence', 'nationality', 'idDocIssuer'].includes(stringTag)) {
            value = isoToCountryName(i18n.resolvedLanguage)(value);
        }

        return {
            attribute: getAttributeName(stringTag),
            value: value ?? 'Unavailable',
            isRequirementMet: raw !== undefined,
        };
    });

    return <DisplayStatementView reveal lines={lines} dappName={dappName} header={header} className={className} />;
}

export default function AccountStatement({
    credentialStatement,
    validCredentials,
    dappName,
    setChosenId,
    net,
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
            <p className="web3-id-proof-request__description bodyM">{t('descriptions.accountCredential')}</p>
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
                    schema={IDENTITY_SUBJECT_SCHEMA}
                />
            )}
            {secrets.length !== 0 && (
                <DisplaySecretStatements
                    className="web3-id-proof-request__statement"
                    attributes={identity.idObject.value.attributeList.chosenAttributes}
                    statements={secrets}
                    formatAttribute={displayAttribute}
                    schema={IDENTITY_SUBJECT_SCHEMA}
                />
            )}
        </div>
    );
}
