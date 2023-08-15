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
    ContractAddress,
    CommitmentInput,
    createWeb3IdDID,
    StatementTypes,
} from '@concordium/web-sdk';
import { isIdentityOfCredential } from '@shared/utils/identity-helpers';
import { ConfirmedIdentity, CreationStatus, VerifiableCredential, WalletCredential } from '@shared/storage/types';
import { ClassName } from 'wallet-common-helpers';

export type SecretStatementV2 = Exclude<AtomicStatementV2, RevealStatementV2>;

export interface DisplayCredentialStatementProps<Statement> extends ClassName {
    credentialStatement: Statement;
    dappName: string;
    setChosenId: (id: string) => void;
    net: Network;
}

/** Takes a Web3IdCredential issuer DID string and returns the contract address
 * @param did a issuer DID string on the form: "did:ccd:testnet:sci:INDEX:SUBINDEX/issuer"
 * @returns the contract address INDEX;SUBINDEX
 */
export function getContractAddressFromIssuerDID(did: string): ContractAddress {
    const split = did.split(':');
    if (split.length !== 6 || split[3] !== 'sci') {
        throw new Error('Given DID did not follow expected format');
    }
    const index = BigInt(split[4]);
    const subindex = BigInt(split[5].substring(0, split[5].indexOf('/')));
    return { index, subindex };
}

/** Takes a Web3IdCredential subject DID string and returns the publicKey of the verifiable credential
 * @param did a DID string on the form: "did:ccd:NETWORK:sci:INDEX:SUBINDEX/credentialEntry/KEY"
 * @returns the public key KEY
 */
export function getVerifiableCredentialPublicKeyfromSubjectDID(did: string) {
    const split = did.split('/');
    if (split.length !== 3 || split[0].split(':')[3] !== 'sci') {
        throw new Error(`Given DID did not follow expected format:${did}`);
    }
    return split[2];
}

/** Takes a AccountCredential subject DID string and returns the credential id of the account credential
 * @param did a DID string on the form: "did:ccd:NETWORK:cred:CREDID"
 * @returns the credId CREDID
 */
export function getCredentialIdFromSubjectDID(did: string) {
    const split = did.split(':');
    if (split.length !== 5 || split[3] !== 'cred') {
        throw new Error(`Given DID did not follow expected format: ${did}`);
    }
    return split[4];
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
    if (statement.type) {
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
        identity.providerIndex,
        credential.credNumber
    );
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
            if (identity && identity.status === CreationStatus.Confirmed) {
                return canProveCredentialStatement(credentialStatement, identity.idObject.value.attributeList);
            }
        }
        return false;
    });
}

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
    verifiableCredentials: VerifiableCredential[]
): VerifiableCredential[] {
    // TODO check that credentials are active (maybe before this instead for each statement)
    const allowedContracts = credentialStatement.idQualifier.issuers;
    const allowedCredentials = verifiableCredentials?.filter((vc) =>
        allowedContracts.some((address) => BigInt(address.index) === getContractAddressFromIssuerDID(vc.issuer).index)
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
