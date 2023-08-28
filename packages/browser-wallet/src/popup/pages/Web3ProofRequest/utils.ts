import {
    RequestStatement,
    ConcordiumHdWallet,
    createWeb3CommitmentInputWithHdWallet,
    createAccountCommitmentInputWithHdWallet,
    VerifiableCredentialStatement,
    AccountCredentialStatement,
    Network,
    AtomicStatementV2,
    RevealStatementV2,
    createWeb3IdDID,
    StatementTypes,
    isStringAttributeInRange,
    AttributeType,
} from '@concordium/web-sdk';
import { isIdentityOfCredential } from '@shared/utils/identity-helpers';
import {
    ConfirmedIdentity,
    CreationStatus,
    VerifiableCredential,
    VerifiableCredentialStatus,
    WalletCredential,
} from '@shared/storage/types';
import { ClassName } from 'wallet-common-helpers';
import {
    getContractAddressFromIssuerDID,
    getCredentialIdFromSubjectDID,
    getVerifiableCredentialPublicKeyfromSubjectDID,
} from '@shared/utils/verifiable-credential-helpers';
import { areContractAddressesEqual } from '@shared/utils/contract-helpers';

export type SecretStatementV2 = Exclude<AtomicStatementV2, RevealStatementV2>;

export interface DisplayCredentialStatementProps<Statement, Credential> extends ClassName {
    credentialStatement: Statement;
    validCredentials: Credential[];
    dappName: string;
    setChosenId: (id: string) => void;
    net: Network;
}

export function getAccountCredentialCommitmentInput(
    statement: RequestStatement,
    wallet: ConcordiumHdWallet,
    identities: ConfirmedIdentity[],
    credentials: WalletCredential[]
) {
    const credId = getCredentialIdFromSubjectDID(statement.id);
    const credential = credentials.find((cred) => cred.credId === credId);

    if (!credential) {
        throw new Error('IdQualifier not fulfilled');
    }

    const identity = (identities || []).find((id) => isIdentityOfCredential(id)(credential));

    if (!identity || identity.status !== CreationStatus.Confirmed) {
        throw new Error('No identity found for credential');
    }

    return createAccountCommitmentInputWithHdWallet(
        statement.statement,
        identity.providerIndex,
        identity.idObject.value.attributeList,
        wallet,
        identity.index,
        credential.credNumber
    );
}

export function getWeb3CommitmentInput(verifiableCredential: VerifiableCredential, wallet: ConcordiumHdWallet) {
    return createWeb3CommitmentInputWithHdWallet(
        wallet,
        getContractAddressFromIssuerDID(verifiableCredential.issuer),
        verifiableCredential.index,
        verifiableCredential.credentialSubject,
        verifiableCredential.randomness,
        verifiableCredential.signature
    );
}

function isInRange(value: AttributeType, lower: AttributeType, upper: AttributeType) {
    if (typeof value === 'string' && typeof lower === 'string' && typeof upper === 'string') {
        return isStringAttributeInRange(value, lower, upper);
    }
    if (typeof value === 'bigint' && typeof lower === 'bigint' && typeof upper === 'bigint') {
        return lower <= value && upper > value;
    }
    if (value instanceof Date && lower instanceof Date && upper instanceof Date) {
        return lower.getTime() <= value.getTime() && upper.getTime() > value.getTime();
    }
    // Mismatch in types.
    return false;
}

// TODO Replace with canProveAtomicStatement when SDK is updated (AttributeNotInSet vs undefined)
function doesCredentialSatisfyStatement(
    statement: AtomicStatementV2,
    attributes: Record<string, AttributeType>
): boolean {
    const value = attributes[statement.attributeTag];

    if (value === undefined) {
        return false;
    }

    switch (statement.type) {
        case StatementTypes.AttributeInRange:
            return isInRange(value, statement.lower, statement.upper);
        case StatementTypes.AttributeInSet:
            return statement.set.includes(value);
        case StatementTypes.AttributeNotInSet:
            return !statement.set.includes(value);
        case StatementTypes.RevealAttribute:
            return value !== undefined;
        default:
            throw new Error('Unknown statementType encountered');
    }
}

/**
 * Given a credential statement for an account credential, and a list of account credentials, return the filtered list of credentials that satisfy the statement.
 * Note this also requires the identities for the account credentials as an additional argument, to actually check the attributes of the credential.
 */
export function getViableAccountCredentialsForStatement(
    credentialStatement: AccountCredentialStatement,
    identities: ConfirmedIdentity[],
    credentials: WalletCredential[]
): WalletCredential[] {
    const allowedIssuers = credentialStatement.idQualifier.issuers;
    return credentials?.filter((c) => {
        if (allowedIssuers.includes(c.providerIndex)) {
            const identity = (identities || []).find((id) => isIdentityOfCredential(id)(c));
            if (identity) {
                credentialStatement.statement.every((stm) =>
                    doesCredentialSatisfyStatement(stm, identity.idObject.value.attributeList.chosenAttributes)
                );
            }
        }
        return false;
    });
}

/**
 * Given a credential statement for a verifiable credential, and a list of verifiable credentials, return the filtered list of verifiable credentials that satisfy the statement.
 */
export function getViableWeb3IdCredentialsForStatement(
    credentialStatement: VerifiableCredentialStatement,
    verifiableCredentials: VerifiableCredential[],
    statuses: Record<string, VerifiableCredentialStatus | undefined>
): VerifiableCredential[] {
    const allowedContracts = credentialStatement.idQualifier.issuers;
    const allowedCredentials = verifiableCredentials?.filter(
        (vc) =>
            allowedContracts.some((address) =>
                areContractAddressesEqual(address, getContractAddressFromIssuerDID(vc.issuer))
            ) && statuses[vc.id] === VerifiableCredentialStatus.Active
    );

    return allowedCredentials.filter((cred) =>
        credentialStatement.statement.every((stm) =>
            doesCredentialSatisfyStatement(stm, cred.credentialSubject.attributes)
        )
    );
}

/**
 * Helper function to create a web3Id DID string from a verifiable credential
 */
export function createWeb3IdDIDFromCredential(credential: VerifiableCredential, net: Network) {
    const contractAddress = getContractAddressFromIssuerDID(credential.issuer);
    return createWeb3IdDID(
        net,
        getVerifiableCredentialPublicKeyfromSubjectDID(credential.id),
        BigInt(contractAddress.index),
        BigInt(contractAddress.subindex)
    );
}
