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
import { VerifiableCredential, CredentialSubject } from '@shared/storage/types';
import { useAtomValue } from 'jotai';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ClassName } from 'wallet-common-helpers';
import { DisplayStatementView, StatementLine } from '../IdProofRequest/DisplayStatement/DisplayStatement';
import CredentialSelector from './CredentialSelector';
import {
    createWeb3IdDIDFromCredential,
    DisplayCredentialStatementProps,
    getVerifiableCredentialPublicKeyfromSubjectDID,
    getViableWeb3IdCredentialsForStatement,
    SecretStatementV2,
} from './utils';

type DisplayWeb3StatementProps<Statement> = ClassName & {
    statements: Statement;
    dappName: string;
    credential: CredentialSubject;
};

type AttributeInfo = {
    name: string;
    value: string | bigint;
};

function extractAttributesFromCredentialSubjectForSingleStatement(
    { attributeTag }: AtomicStatementV2,
    credentialSubject: CredentialSubject
): AttributeInfo {
    return { name: attributeTag, value: credentialSubject[attributeTag] };
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

export function DisplayWeb3RevealStatement({
    statements,
    dappName,
    credential,
    className,
}: DisplayWeb3StatementProps<RevealStatementV2[]>) {
    const { t } = useTranslation('idProofRequest', { keyPrefix: 'displayStatement' });
    const attributes = extractAttributesFromCredentialSubject(statements, credential);
    const header = t('headers.reveal');

    const lines: StatementLine[] = statements.map((s) => {
        const { name, value } = attributes[s.attributeTag];

        return {
            attribute: name,
            value: value.toString() ?? 'Unavailable',
            isRequirementMet: value !== undefined,
        };
    });

    return <DisplayStatementView reveal lines={lines} dappName={dappName} header={header} className={className} />;
}

export function DisplayWeb3SecretStatement({
    statements,
    dappName,
    credential,
    className,
}: DisplayWeb3StatementProps<SecretStatementV2>) {
    const { t } = useTranslation('idProofRequest', { keyPrefix: 'displayStatement' });
    const { name, value } = extractAttributesFromCredentialSubjectForSingleStatement(statements, credential);
    const header = t('headers.reveal');

    const lines: StatementLine[] = [
        {
            attribute: name,
            value: value.toString() ?? 'Unavailable',
            isRequirementMet: value !== undefined,
        },
    ];

    return <DisplayStatementView lines={lines} dappName={dappName} header={header} className={className} />;
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

    if (!chosenCredential || !schema) {
        return null;
    }

    return (
        <div>
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
                />
            )}
            {secrets.map((s, i) => (
                <DisplayWeb3SecretStatement
                    // eslint-disable-next-line react/no-array-index-key
                    key={i} // Allow this, as we don't expect these to ever change.
                    className="m-t-10:not-first"
                    dappName={dappName}
                    credential={chosenCredential.credentialSubject}
                    statements={s}
                />
            ))}
        </div>
    );
}
