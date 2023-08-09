import {
    CredentialStatement,
    isAccountCredentialStatement,
    isVerifiableCredentialStatement,
} from '@concordium/web-sdk';
import React from 'react';
import { DisplayCredentialStatementProps } from './utils';
import DisplayWeb3Statement from './VerifiableCredentialStatement';
import DisplayAccountStatement from './AccountStatement';

export function DisplayCredentialStatement({
    credentialStatement,
    ...params
}: DisplayCredentialStatementProps<CredentialStatement>) {
    if (isAccountCredentialStatement(credentialStatement)) {
        return <DisplayAccountStatement credentialStatement={credentialStatement} {...params} />;
    }
    if (isVerifiableCredentialStatement(credentialStatement)) {
        return <DisplayWeb3Statement credentialStatement={credentialStatement} {...params} />;
    }
    return null;
}
