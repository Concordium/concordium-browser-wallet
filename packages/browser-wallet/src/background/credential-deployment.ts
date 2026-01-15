import { ExtensionMessageHandler } from '@messaging';

import {
    CredentialInput,
    getAccountAddress,
    ConcordiumGRPCWebClient,
    createCredentialTransaction,
    signCredentialTransaction,
    ConcordiumHdWallet,
    TransactionExpiry,
    getCredentialDeploymentTransactionHash,
    CredentialRegistrationId,
    serializeCredentialDeploymentPayload,
} from '@concordium/web-sdk';
import { GRPCTIMEOUT } from '@shared/constants/networkConfiguration';
import { DEFAULT_TRANSACTION_EXPIRY } from '@shared/constants/time';
import { sessionCreatingCredential, storedCurrentNetwork, storedSelectedAccount } from '@shared/storage/access';
import { CreationStatus, PendingWalletCredential, AccountType } from '@shared/storage/types';
import { BackgroundResponseStatus, CredentialDeploymentBackgroundResponse } from '@shared/utils/types';
import { confirmCredential } from './confirmation';
import { addCredential } from './update';

// Extended credential input type for Ledger accounts
export interface LedgerCredentialInput extends Omit<CredentialInput, 'seedAsHex'> {
    ledgerPath: string;
    ledgerDeviceId: string;
    accountType: AccountType.LedgerBased;
}

export type UnifiedCredentialInput = CredentialInput | LedgerCredentialInput;

// Helper to check if input is for Ledger
function isLedgerCredentialInput(input: UnifiedCredentialInput): input is LedgerCredentialInput {
    return 'ledgerPath' in input && input.accountType === AccountType.LedgerBased;
}

async function createAndSendCredential(
    credIn: UnifiedCredentialInput
): Promise<CredentialDeploymentBackgroundResponse> {
    let address: string;
    try {
        const network = await storedCurrentNetwork.get();
        if (!network) {
            throw new Error('No network available');
        }

        const { identityIndex, credNumber } = credIn;
        const providerIndex = credIn.ipInfo.ipIdentity;

        const expiry = TransactionExpiry.fromDate(new Date(Date.now() + DEFAULT_TRANSACTION_EXPIRY));
        const request = createCredentialTransaction(credIn as CredentialInput, expiry);

        let signature: string;
        let accountType: AccountType;
        let ledgerPath: string | undefined;
        let ledgerDeviceId: string | undefined;

        if (isLedgerCredentialInput(credIn)) {
            // Ledger-based credential deployment
            // Note: This would require importing Ledger helpers in background context
            // For now, this is a placeholder - actual Ledger signing should be done in popup context
            // and signature passed to background, or Ledger transport needs to be available in background
            throw new Error('Ledger credential deployment must be initiated from popup context');
            // Future implementation:
            // const { concordiumApp } = await connectLedgerDevice();
            // const credentialHash = getCredentialDeploymentHash(request);
            // const { signature: ledgerSig } = await signCredentialWithLedger(
            //     concordiumApp,
            //     credIn.ledgerPath,
            //     Buffer.from(credentialHash, 'hex')
            // );
            // signature = ledgerSig.toString('hex');
            // accountType = AccountType.LedgerBased;
            // ledgerPath = credIn.ledgerPath;
            // ledgerDeviceId = credIn.ledgerDeviceId;
        } else {
            // Seed phrase-based credential deployment (existing logic)
            const signingKey = ConcordiumHdWallet.fromHex(credIn.seedAsHex, credIn.net)
                .getAccountSigningKey(providerIndex, identityIndex, credNumber)
                .toString('hex');
            signature = await signCredentialTransaction(request, signingKey);
            accountType = AccountType.SeedPhraseBased;
        }

        const { credId } = request.unsignedCdi;
        const deploymentHash = getCredentialDeploymentTransactionHash(request, [signature]);
        address = getAccountAddress(credId).address;
        const newCred: PendingWalletCredential = {
            address,
            identityIndex,
            providerIndex,
            credId,
            credNumber,
            credName: '',
            status: CreationStatus.Pending,
            deploymentHash,
            accountType,
            ledgerPath,
            ledgerDeviceId,
        };

        const client = new ConcordiumGRPCWebClient(network.grpcUrl, network.grpcPort, {
            timeout: GRPCTIMEOUT,
        });

        // Check that the credential has not already been deployed:
        try {
            const accountInfo = await client.getAccountInfo(CredentialRegistrationId.fromHexString(credId));
            const existingAddress = accountInfo.accountAddress.address;
            await addCredential(
                {
                    identityIndex,
                    providerIndex,
                    credId,
                    credNumber,
                    credName: '',
                    address: existingAddress,
                    status: CreationStatus.Confirmed,
                },
                network.genesisHash
            );

            // Set Selected to new account
            await storedSelectedAccount.set(existingAddress);

            return {
                status: BackgroundResponseStatus.Aborted,
                address: existingAddress,
            };
        } catch {
            // If an error is thrown, we assume this is because the credential has not been deployed yet.
        }

        // Send Request
        const payload = serializeCredentialDeploymentPayload([signature], request);
        const successful = await client.sendCredentialDeploymentTransaction(payload, expiry);
        if (!successful) {
            throw new Error('Credential deployment was rejected');
        }

        // Add Pending
        await addCredential(newCred, network.genesisHash);
        confirmCredential(newCred, network);
        // Set Selected to new account
        await storedSelectedAccount.set(address);
    } finally {
        // Remove guard stopping another credential being created
        await sessionCreatingCredential.set(false);
    }

    return {
        status: BackgroundResponseStatus.Success,
        address,
    };
}

export const sendCredentialHandler: ExtensionMessageHandler = (msg, _sender, respond) => {
    createAndSendCredential(msg.payload)
        .then(respond)
        .catch((e) => respond({ status: BackgroundResponseStatus.Error, error: e.toString() }));
    return true;
};
