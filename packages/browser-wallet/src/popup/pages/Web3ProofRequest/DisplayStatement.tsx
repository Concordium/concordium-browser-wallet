import {
    CredentialStatement,
    isAccountCredentialStatement,
    isVerifiableCredentialStatement,
} from '@concordium/web-sdk';
import React from 'react';
import { VerifiableCredential, WalletCredential } from '@shared/storage/types';
import { DisplayCredentialStatementProps } from './utils';
import DisplayWeb3Statement from './VerifiableCredentialStatement';
import DisplayAccountStatement from './AccountStatement';

export function DisplayCredentialStatement({
    credentialStatement,
    validCredentials,
    ...params
}: DisplayCredentialStatementProps<CredentialStatement, VerifiableCredential | WalletCredential>) {
    if (isAccountCredentialStatement(credentialStatement)) {
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
