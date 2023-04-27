/* eslint-disable @typescript-eslint/no-explicit-any */
import type HwTransport from '@ledgerhq/hw-transport';
import { Buffer } from 'buffer/';
import { AccountTransaction, Network, UnsignedCredentialDeploymentInformation } from '@concordium/common-sdk';
import { Transport, TransportImpl } from './Transport';
import { getPublicKey, getPublicKeySilent, getSignedPublicKey } from './GetPublicKey';
import signTransfer from './Transfer';
import signPublicInformationForIp from './PublicInformationForIp';
import { getPrfKeyDecrypt, getPrivateKeys, getPrfKeyRecovery } from './ExportPrivateKeySeed';
import {
    signCredentialDeploymentOnNewAccount,
    signCredentialDeploymentOnExistingAccount,
} from './CredentialDeployment';
import { PrivateKeys, SignedPublicKey, PublicInformationForIp } from '../utils/types';
import { AccountPathInput, getAccountPath } from './Path';
import getAppAndVersion, { AppAndVersion } from './GetAppAndVersion';
import signUpdateCredentialTransaction from './SignUpdateCredentials';
import EmulatorTransport from './EmulatorTransport';
import verifyAddress from './verifyAddress';

/**
 * Concordium Ledger API.
 *
 * @example
 * import ConcordiumLedgerClient from "..."
 * const client = new ConcordiumLedgerClient(transport);
 */
export default class ConcordiumLedgerClient {
    transport: Transport;

    constructor(transport?: HwTransport) {
        if (transport) {
            this.transport = new TransportImpl(transport);
        } else {
            // Transport for communicating with the Ledger Speculos emulator.
            // Only to be used for testing, as the emulator is not secure in any way.
            this.transport = new EmulatorTransport();
        }
    }

    closeTransport(): Promise<void> {
        return this.transport.close();
    }

    getPublicKey(path: number[]): Promise<Buffer> {
        return getPublicKey(this.transport, path);
    }

    getPublicKeySilent(path: number[]): Promise<Buffer> {
        return getPublicKeySilent(this.transport, path);
    }

    getSignedPublicKey(path: number[]): Promise<SignedPublicKey> {
        return getSignedPublicKey(this.transport, path);
    }

    getPrivateKeys(identity: number): Promise<PrivateKeys> {
        return getPrivateKeys(this.transport, identity);
    }

    getPrfKeyDecrypt(identity: number): Promise<Buffer> {
        return getPrfKeyDecrypt(this.transport, identity);
    }

    getPrfKeyRecovery(identity: number): Promise<Buffer> {
        return getPrfKeyRecovery(this.transport, identity);
    }

    verifyAddress(
        network: Network,
        identityProvider: number,
        identity: number,
        credentialNumber: number
    ): Promise<void> {
        return verifyAddress(this.transport, network, identityProvider, identity, credentialNumber);
    }

    signTransfer(transaction: AccountTransaction, path: number[]): Promise<Buffer> {
        return signTransfer(this.transport, path, transaction);
    }

    signUpdateCredentialTransaction(transaction: AccountTransaction, path: number[]): Promise<Buffer> {
        return signUpdateCredentialTransaction(this.transport, path, transaction);
    }

    signPublicInformationForIp(
        publicInfoForIp: PublicInformationForIp,
        accountPathInput: AccountPathInput,
        network: Network
    ): Promise<Buffer> {
        const accountPath = getAccountPath(accountPathInput, network);
        return signPublicInformationForIp(this.transport, accountPath, publicInfoForIp);
    }

    signCredentialDeploymentOnExistingAccount(
        credentialDeployment: UnsignedCredentialDeploymentInformation,
        address: string,
        path: number[]
    ): Promise<Buffer> {
        return signCredentialDeploymentOnExistingAccount(this.transport, credentialDeployment, address, path);
    }

    signCredentialDeploymentOnNewAccount(
        credentialDeployment: UnsignedCredentialDeploymentInformation,
        expiry: bigint,
        path: number[]
    ): Promise<Buffer> {
        return signCredentialDeploymentOnNewAccount(this.transport, credentialDeployment, expiry, path);
    }

    getAppAndVersion(): Promise<AppAndVersion> {
        return getAppAndVersion(this.transport);
    }
}
