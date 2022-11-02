import React from 'react';
import { detectConcordiumProvider } from "@concordium/browser-wallet-api-helpers";
import { Alert, Button } from "react-bootstrap";
import { AccountTransactionType, GtuAmount, ModuleReference } from "@concordium/web-sdk";
import { RAW_SCHEMA_BASE64, TESTNET_GENESIS_BLOCK_HASH } from "./config";
import moment from "moment";

export async function init(setConnectedAccount) {
    const client = await detectConcordiumProvider()
    // Listen for relevant events from the wallet.
    client.on('accountChanged', account => {
        console.debug('browserwallet event: accountChange', { account });
        setConnectedAccount(account);
    });
    client.on('accountDisconnected', () => {
        console.debug('browserwallet event: accountDisconnected');
        client.getMostRecentlySelectedAccount().then(setConnectedAccount);
    });
    client.on('chainChanged', (chain) => {
        console.debug('browserwallet event: chainChanged', { chain });
    });
    client.getMostRecentlySelectedAccount().then(setConnectedAccount);

    return client;
}

export async function connect(client, setConnectedAccount) {
    const account = await client.connect();
    return setConnectedAccount(account);
}

// Check if the user is connected to the testnet chain by checking if the testnet genesisBlock exists.
// The smart contract voting module is deployed on the testnet chain.
async function checkConnectedToTestnet(client) {
    return await client.getJsonRpcClient()
        .getCryptographicParameters(TESTNET_GENESIS_BLOCK_HASH.toString())
        .then((result) => {
            if (result === undefined || result?.value === null) {
                /* eslint-disable no-alert */
                window.alert(
                    'Check if your Concordium browser wallet is connected to testnet!'
                );
                return false;
            } else {
                return true;
            }
        })
}

export async function createElection(client, contractName, description, options, deadlineMinutesInput, moduleRef, senderAddress) {

    let connectedToTestnet = await checkConnectedToTestnet(client);

    if (connectedToTestnet) {
        const deadlineMinutes = Number.parseInt(deadlineMinutesInput);
        const deadlineTimestamp = moment().add(deadlineMinutes, 'm').format();

        const parameter = {
            description: {
                description_text: description,
                options,
            },
            end_time: deadlineTimestamp,
        };

        const txHash = await client.sendTransaction(
            senderAddress,
            AccountTransactionType.InitializeSmartContractInstance,
            {
                amount: new GtuAmount(BigInt(0)),
                moduleRef: new ModuleReference(moduleRef),
                contractName,
                maxContractExecutionEnergy: BigInt(30000),
            },
            parameter,
            RAW_SCHEMA_BASE64,
        );
        console.log({ txHash });
        return txHash;
    }
}


export async function getVotes(client, contractIndex) {
    return client.getJsonRpcClient().invokeContract({
        contract: { index: BigInt(contractIndex), subindex: BigInt(0) },
        method: "voting.getvotes",
    });
}

export async function castVote(client, contractIndex, vote, senderAddress) {

    let connectedToTestnet = await checkConnectedToTestnet(client);

    if (connectedToTestnet) {
        const txHash = await client.sendTransaction(
            senderAddress,
            AccountTransactionType.UpdateSmartContractInstance,
            {
                amount: new GtuAmount(BigInt(0)),
                contractAddress: { index: BigInt(contractIndex), subindex: BigInt(0) },
                receiveName: "voting.vote",
                maxContractExecutionEnergy: BigInt(30000),
            },
            { vote: vote },
            RAW_SCHEMA_BASE64,
        );
        console.log({ txHash });
        return txHash;
    }
}

export default function Wallet(props) {
    const { client, connectedAccount, setConnectedAccount } = props;
    return (
        <>
            {!connectedAccount && (
                <>
                    <p>No wallet connection</p>
                    <Button onClick={() => connect(client, setConnectedAccount).catch(console.error)}>
                        Connect
                    </Button>
                </>
            )}
            {connectedAccount && (
                <Alert variant="success">
                    Connected to account <code>{connectedAccount}</code>.
                </Alert>
            )}
        </>
    );
}
