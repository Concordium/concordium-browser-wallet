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
    canProveCredentialStatement,
    AttributeType,
    CredentialSubject,
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
    chosenId: string;
    setChosenId: (id: string) => void;
    net: Network;
    showDescription?: boolean;
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

export function getAccountCredentialsWithMatchingIssuer(
    credentialStatement: AccountCredentialStatement,
    credentials: WalletCredential[]
) {
    const allowedIssuers = credentialStatement.idQualifier.issuers;
    return credentials?.filter((c) => allowedIssuers.includes(c.providerIndex));
}

/**
 * Given a credential statement for an account credential, and an account credential, return whether the credential satisfies the statement.
 * Note this also requires the identities for the account credentials as an additional argument, to actually check the attributes of the credential.
 */
export function checkIfAccountCredentialIsViableForStatement(
    credentialStatement: AccountCredentialStatement,
    credential: WalletCredential,
    identities: ConfirmedIdentity[]
): boolean {
    const identity = (identities || []).find((id) => isIdentityOfCredential(id)(credential));
    if (identity) {
        return canProveCredentialStatement(credentialStatement, identity.idObject.value.attributeList.chosenAttributes);
    }
    return false;
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
    const accountCredentialsWithMatchingIssuer = getAccountCredentialsWithMatchingIssuer(
        credentialStatement,
        credentials
    );
    return accountCredentialsWithMatchingIssuer?.filter((c) =>
        checkIfAccountCredentialIsViableForStatement(credentialStatement, c, identities)
    );
}

export function getActiveWeb3IdCredentialsWithMatchingIssuer(
    credentialStatement: VerifiableCredentialStatement,
    verifiableCredentials: VerifiableCredential[],
    statuses: Record<string, VerifiableCredentialStatus | undefined> | undefined
) {
    const allowedContracts = credentialStatement.idQualifier.issuers;
    const allowedCredentials = verifiableCredentials?.filter(
        (vc) =>
            allowedContracts.some((address) =>
                areContractAddressesEqual(address, getContractAddressFromIssuerDID(vc.issuer))
            ) &&
            statuses !== undefined &&
            statuses[vc.id] === VerifiableCredentialStatus.Active
    );
    return allowedCredentials;
}

/**
 * Given a credential statement for a verifiable credential, and a list of verifiable credentials, return the filtered list of verifiable credentials that satisfy the statement.
 */
export function getViableWeb3IdCredentialsForStatement(
    credentialStatement: VerifiableCredentialStatement,
    verifiableCredentials: VerifiableCredential[],
    statuses: Record<string, VerifiableCredentialStatus | undefined>
): VerifiableCredential[] {
    const allowedCredentials = getActiveWeb3IdCredentialsWithMatchingIssuer(
        credentialStatement,
        verifiableCredentials,
        statuses
    );
    return allowedCredentials.filter((cred) =>
        canProveCredentialStatement(credentialStatement, cred.credentialSubject.attributes)
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

type AttributeInfo = {
    name: string;
    value: AttributeType;
};

function extractAttributesFromCredentialSubjectForSingleStatement(
    { attributeTag }: AtomicStatementV2,
    credentialSubject: CredentialSubject
): AttributeInfo {
    return { name: attributeTag, value: credentialSubject.attributes[attributeTag] };
}

export function extractAttributesFromCredentialSubject(
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
