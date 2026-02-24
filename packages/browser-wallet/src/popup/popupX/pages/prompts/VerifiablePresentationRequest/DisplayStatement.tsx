import { isAccountCredentialStatement, isVerifiableCredentialStatement } from '@concordium/web-sdk';
import React from 'react';
import { ConfirmedIdentity, VerifiableCredential, WalletCredential } from '@shared/storage/types';
import { DisplayCredentialStatementProps, StatementWithSource } from './utils';
import DisplayWeb3Statement from './VerifiableCredentialStatement';
import DisplayAccountStatement from './AccountStatement';
import DisplayIdentityStatement from './IdentityStatement';

export function DisplayCredentialStatement({
    credentialStatement,
    validCredentials,
    ...params
}: DisplayCredentialStatementProps<StatementWithSource, VerifiableCredential | WalletCredential | ConfirmedIdentity>) {
    if (credentialStatement.source?.includes('identityCredential')) {
        return (
            <DisplayIdentityStatement
                credentialStatement={credentialStatement}
                validCredentials={validCredentials as ConfirmedIdentity[]}
                {...params}
            />
        );
    }
    if (
        isAccountCredentialStatement(credentialStatement) ||
        credentialStatement.source?.includes('accountCredential')
    ) {
        return (
            <DisplayAccountStatement
                credentialStatement={credentialStatement}
                validCredentials={validCredentials as WalletCredential[]}
                {...params}
            />
        );
    }
    if (isVerifiableCredentialStatement(credentialStatement)) {
        return (
            <DisplayWeb3Statement
                credentialStatement={credentialStatement}
                validCredentials={validCredentials as VerifiableCredential[]}
                {...params}
            />
        );
    }

    throw new Error('Invalid Statement encountered');
}
