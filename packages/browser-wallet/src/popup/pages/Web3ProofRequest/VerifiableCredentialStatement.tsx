import {
    AtomicStatementV2,
    RevealStatementV2,
    StatementTypes,
    VerifiableCredentialStatement,
} from '@concordium/web-sdk';
import {
    storedVerifiableCredentialsAtom,
    storedVerifiableCredentialSchemasAtom,
} from '@popup/store/verifiable-credential';
import {
    VerifiableCredential,
    CredentialSubject,
    VerifiableCredentialSchema,
    VerifiableCredentialStatus,
} from '@shared/storage/types';
import { useAtomValue } from 'jotai';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ClassName } from 'wallet-common-helpers';
import { DisplayStatementView, StatementLine } from '../IdProofRequest/DisplayStatement/DisplayStatement';
import { VerifiableCredentialCard } from '../VerifiableCredential/VerifiableCredentialCard';
import { useCredentialMetadata } from '../VerifiableCredential/VerifiableCredentialHooks';
import CredentialSelector from './CredentialSelector';
import {
    createWeb3IdDIDFromCredential,
    DisplayCredentialStatementProps,
    getVerifiableCredentialPublicKeyfromSubjectDID,
    getViableWeb3IdCredentialsForStatement,
    SecretStatementV2,
} from './utils';

function getPropertyTitle(attributeTag: string, schema: VerifiableCredentialSchema) {
    const property = schema.properties.credentialSubject.properties.attributes.properties[attributeTag];
    return property.title;
}

function useStatementValue(statement: SecretStatementV2, schema: VerifiableCredentialSchema): string {
    const { t } = useTranslation('web3IdProofRequest', { keyPrefix: 'displayStatement.proofs' });

    const name = getPropertyTitle(statement.attributeTag, schema);
    if (statement.type === StatementTypes.AttributeInRange) {
        return t('range', { name, upper: statement.upper, lower: statement.lower });
    }
    if (statement.type === StatementTypes.AttributeInSet) {
        return t('membership', { name });
    }
    if (statement.type === StatementTypes.AttributeNotInSet) {
        return t('nonMembership', { name });
    }
    // TODO What to do here?
    return '';
}

export function useStatementDescription(statement: SecretStatementV2, schema: VerifiableCredentialSchema) {
    const { t } = useTranslation('web3IdProofRequest', { keyPrefix: 'displayStatement.descriptions' });
    const name = getPropertyTitle(statement.attributeTag, schema);
    const listToString = (list: (string | bigint)[]) => list.map((member) => member.toString()).join(', ');

    switch (statement.type) {
        case StatementTypes.AttributeInRange:
            return t('range', { name, lower: statement.lower, upper: statement.upper });
        case StatementTypes.AttributeInSet:
            return t('membership', { name, setNames: listToString(statement.set) });
        case StatementTypes.AttributeNotInSet:
            return t('nonMembership', { name, setNames: listToString(statement.set) });
        default:
            return undefined;
    }
}

type DisplayWeb3StatementProps<Statement> = ClassName & {
    statements: Statement;
    dappName: string;
    schema: VerifiableCredentialSchema;
};

type AttributeInfo = {
    name: string;
    value: string | bigint;
};

function extractAttributesFromCredentialSubjectForSingleStatement(
    { attributeTag }: AtomicStatementV2,
    credentialSubject: CredentialSubject
): AttributeInfo {
    return { name: attributeTag, value: credentialSubject.attributes[attributeTag] };
}

function extractAttributesFromCredentialSubject(
    statements: AtomicStatementV2[],
    credentialSubject: CredentialSubject
): Record<string, AttributeInfo> {
    return statements.reduce<Record<string, AttributeInfo>>((acc, statement) => {
        acc[statement.attributeTag] = extractAttributesFromCredentialSubjectForSingleStatement(
            statement,
            credentialSubject
        );
        return acc;
    }, {});
}

type DisplayWeb3RevealStatementProps = DisplayWeb3StatementProps<RevealStatementV2[]> & {
    credential: CredentialSubject;
};

export function DisplayWeb3RevealStatement({
    statements,
    dappName,
    credential,
    className,
    schema,
}: DisplayWeb3RevealStatementProps) {
    const { t } = useTranslation('web3IdProofRequest', { keyPrefix: 'displayStatement' });
    const attributes = extractAttributesFromCredentialSubject(statements, credential);
    const header = t('headers.reveal');

    const lines: StatementLine[] = statements.map((s) => {
        const { value } = attributes[s.attributeTag];
        const property = schema.properties.credentialSubject.properties.attributes.properties[s.attributeTag];
        return {
            attribute: property.title,
            value: value.toString() ?? 'Unavailable',
            isRequirementMet: value !== undefined,
        };
    });

    return <DisplayStatementView reveal lines={lines} dappName={dappName} header={header} className={className} />;
}

export function DisplayWeb3SecretStatement({
    statements,
    dappName,
    className,
    schema,
}: DisplayWeb3StatementProps<SecretStatementV2>) {
    const { t } = useTranslation('web3IdProofRequest', { keyPrefix: 'displayStatement' });
    const value = useStatementValue(statements, schema);
    const header = t('headers.secret');
    const property = schema.properties.credentialSubject.properties.attributes.properties[statements.attributeTag];
    const description = useStatementDescription(statements, schema);

    const lines: StatementLine[] = [
        {
            attribute: property.title,
            value,
            isRequirementMet: value !== undefined,
        },
    ];

    return (
        <DisplayStatementView
            lines={lines}
            dappName={dappName}
            header={header}
            className={className}
            description={description}
        />
    );
}

export default function DisplayWeb3Statement({
    credentialStatement,
    dappName,
    setChosenId,
    net,
}: DisplayCredentialStatementProps<VerifiableCredentialStatement>) {
    const reveals = credentialStatement.statement.filter(
        (s) => s.type === StatementTypes.RevealAttribute
    ) as RevealStatementV2[];
    const secrets = credentialStatement.statement.filter(
        (s) => s.type !== StatementTypes.RevealAttribute
    ) as SecretStatementV2[];
    const verifiableCredentials = useAtomValue(storedVerifiableCredentialsAtom);
    const verifiableCredentialSchemas = useAtomValue(storedVerifiableCredentialSchemasAtom);

    const validCredentials = useMemo(() => {
        if (!verifiableCredentials) {
            return [];
        }
        return getViableWeb3IdCredentialsForStatement(credentialStatement, verifiableCredentials);
    }, [credentialStatement.idQualifier.issuers]);

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
    }, [chosenCredential?.id, verifiableCredentials?.length]);

    const metadata = useCredentialMetadata(chosenCredential);

    if (!chosenCredential || !schema || !metadata) {
        return null;
    }

    return (
        <div className="web3-id-proof-request__credential-statement-container">
            <VerifiableCredentialCard
                credentialSubject={chosenCredential.credentialSubject}
                schema={schema}
                credentialStatus={VerifiableCredentialStatus.Active}
                metadata={metadata}
            />

            <CredentialSelector
                options={validCredentials}
                displayOption={(option) => getVerifiableCredentialPublicKeyfromSubjectDID(option.id)}
                onChange={onChange}
            />
            {reveals.length !== 0 && (
                <DisplayWeb3RevealStatement
                    className="m-t-10:not-first"
                    dappName={dappName}
                    credential={chosenCredential.credentialSubject}
                    statements={reveals}
                    schema={schema}
                />
            )}
            {secrets.map((s, i) => (
                <DisplayWeb3SecretStatement
                    // eslint-disable-next-line react/no-array-index-key
                    key={i} // Allow this, as we don't expect these to ever change.
                    className="m-t-10:not-first"
                    dappName={dappName}
                    statements={s}
                    schema={schema}
                />
            ))}
        </div>
    );
}
