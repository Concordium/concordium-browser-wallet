/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState } from 'react';
import ConcordiumApp from '@blooo/hw-app-concordium';
import TransportWebHID from '@ledgerhq/hw-transport-webhid';
import { grpcClientAtom } from '@popup/store/settings';
import { useAtomValue } from 'jotai';
import {
    AccountTransactionType,
    CredentialInput,
    serializeAccountTransactionForSubmission,
    ConcordiumGRPCClient,
    getAccountAddress,
    signTransaction,
} from '@concordium/web-sdk';
/*
import {
    getDefaultExpiry,
    createPendingTransactionFromAccountTransaction,
    sendTransaction,
} from '@popup/shared/utils/transaction-helpers'; */

export async function createIdentity(
    setStatus: (msg: string) => void,
    client: ConcordiumGRPCClient // <-- use the actual gRPC client type
) {
    setStatus('🔌 Connecting to Ledger...');
    const transport = await TransportWebHID.create();
    const concordium = new ConcordiumApp(transport);

    const path = '44/919/0/0/0/0';
    const { publicKey } = await concordium.getPublicKey(path);

    setStatus('📡 Public key retrieved.');

    setStatus('📨 Requesting identity from IDP...');
    const response = await fetch('https://id-service.testnet.concordium.com/api/v1/identity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicKey: Buffer.from(publicKey).toString('hex') }),
    });

    if (!response.ok) throw new Error('IDP request failed');
    const identity = await response.json();
    const { identityIndex } = identity;

    setStatus(`✅ Identity registered (index: ${identityIndex}).`);
    return { identityIndex, publicKey, credId: null }; // credId will be filled later
}

export default function RestoreLedger() {
    const [status, setStatus] = useState('Idle');
    const [txHash, setTxHash] = useState<string | null>(null);
    const [accountAddress, setAccountAddress] = useState<string | null>(null);
    const [accountBalance, setAccountBalance] = useState<string | null>(null);

    const client = useAtomValue(grpcClientAtom);

    const handleOnboard = async () => {
        setStatus('🔌 Starting onboarding...');
        setTxHash(null);
        setAccountAddress(null);
        setAccountBalance(null);

        try {
            // Pass client to createIdentity
            const { identityIndex, publicKey, credId } = await createIdentity(setStatus, client);

            setTxHash(identityIndex.toString());
            setAccountAddress(publicKey.toString());
            setAccountBalance(credId);
            setStatus('🎉 Account created successfully!');
        } catch (err: unknown) {
            setStatus('❌ Error');
            setTxHash(null);
            setAccountAddress(null);
            setAccountBalance(null);
            if (err instanceof Error) {
                console.error(err);
            } else {
                console.error('Unknown error', err);
            }
        }
    };

    return (
        <div style={{ padding: '1rem', fontFamily: 'sans-serif', maxWidth: 500 }}>
            <h2>Concordium Identity + Account Setup</h2>
            <button
                type="button"
                onClick={handleOnboard}
                disabled={status.includes('Connecting') || status.includes('Signing')}
            >
                Start Onboarding
            </button>
            <p>
                <strong>Status:</strong> {status}
            </p>
            {txHash && (
                <div style={{ marginTop: '1rem' }}>
                    <strong>Tx Hash:</strong> <pre>{txHash}</pre>
                </div>
            )}
            {accountAddress && (
                <div style={{ marginTop: '1rem' }}>
                    <strong>Account Address:</strong> <pre>{accountAddress}</pre>
                </div>
            )}
            {accountBalance && (
                <div style={{ marginTop: '1rem' }}>
                    <strong>Balance:</strong> {accountBalance} CCD
                </div>
            )}
        </div>
    );
}
