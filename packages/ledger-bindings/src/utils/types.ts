import { VerifyKey } from '@concordium/common-sdk';
import { Buffer } from 'buffer/';

type Hex = string;

export type PrivateKeys = {
    idCredSec: Buffer;
    prfKey: Buffer;
};

export interface SignedPublicKey {
    key: Hex;
    signature: Hex;
}

interface CredentialPublicKeys {
    keys: Record<number, VerifyKey>;
    threshold: number;
}

/**
 * This interface models the PublicInformationForIp structure, which we get from the Crypto Dependency
 * (And is used during Identity Issuance)
 */
export interface PublicInformationForIp {
    idCredPub: Hex;
    regId: Hex;
    publicKeys: CredentialPublicKeys;
}

export enum SchemeId {
    Ed25519 = 0,
}

export interface SerializedTextWithLength {
    data: Buffer;
    length: Buffer;
}
