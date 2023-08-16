import {
    RequestStatement,
    canProveCredentialStatement,
    ConcordiumHdWallet,
    createWeb3CommitmentInputWithHdWallet,
    createAccountCommitmentInputWithHdWallet,
    VerifiableCredentialStatement,
    AccountCredentialStatement,
    Network,
    AtomicStatementV2,
    RevealStatementV2,
    CommitmentInput,
    createWeb3IdDID,
    StatementTypes,
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

export interface DisplayCredentialStatementProps<Statement> extends ClassName {
    credentialStatement: Statement;
    dappName: string;
    setChosenId: (id: string) => void;
    net: Network;
    statuses: Record<string, VerifiableCredentialStatus | undefined>;
}

function getAccountCredentialCommitmentInput(
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

    const identity = (identities || []).find(isIdentityOfCredential);

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

function createWeb3CommitmentInput(
    statement: RequestStatement,
    wallet: ConcordiumHdWallet,
    verifiableCredentials: VerifiableCredential[]
) {
    const cred = verifiableCredentials?.find((c) => c.id === statement.id);

    if (!cred) {
        throw new Error('IdQualifier not fulfilled');
    }

    return createWeb3CommitmentInputWithHdWallet(
        wallet,
        getContractAddressFromIssuerDID(cred.issuer),
        cred.index,
        cred.credentialSubject,
        cred.randomness,
        cred.signature
    );
}

/**
 * Build the commitmentInputs required to create a presentation for the given statement.
 */
export function getCommitmentInput(
    statement: RequestStatement,
    wallet: ConcordiumHdWallet,
    identities: ConfirmedIdentity[],
    credentials: WalletCredential[],
    verifiableCredentials: VerifiableCredential[]
): CommitmentInput {
    // TODO replace with isVerifiableCredentialRequestStatement when SDK is updated
    if (statement.type) {
        return createWeb3CommitmentInput(statement, wallet, verifiableCredentials);
    }
    return getAccountCredentialCommitmentInput(statement, wallet, identities, credentials);
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
                return canProveCredentialStatement(credentialStatement, identity.idObject.value.attributeList);
            }
        }
        return false;
    });
}

// TODO Replace with canProveAtomicStatement when SDK is updated
function doesCredentialSatisfyStatement(statement: AtomicStatementV2, cred: VerifiableCredential): boolean {
    const value = cred.credentialSubject.attributes[statement.attributeTag];
    switch (statement.type) {
        case StatementTypes.AttributeInRange:
            return statement.lower <= value && statement.upper > value;
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
        credentialStatement.statement.every((stm) => doesCredentialSatisfyStatement(stm, cred))
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
