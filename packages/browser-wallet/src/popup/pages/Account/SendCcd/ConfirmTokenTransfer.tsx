import React, { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSetAtom, useAtomValue } from 'jotai';
import { selectedAccountAtom } from '@popup/store/account';
import {
    AccountAddress,
    AccountTransactionType,
    InstanceInfo,
    JsonRpcClient,
    SimpleTransferPayload,
    UpdateContractPayload,
} from '@concordium/web-sdk';
import { getDefaultExpiry, sendTransaction } from '@popup/shared/utils/transaction-helpers';
import { jsonRpcClientAtom } from '@popup/store/settings';
import { addToastAtom } from '@popup/state';
import { usePrivateKey } from '@popup/shared/utils/account-helpers';
import Button from '@popup/shared/Button';
import { useLocation, useNavigate } from 'react-router-dom';
import { absoluteRoutes } from '@popup/constants/routes';
import TransactionReceipt from '@popup/shared/TransactionReceipt/TransactionReceipt';
import { useAsyncMemo } from 'wallet-common-helpers';
import { getTokenTransferParameters, getTokenTransferPayload } from '@shared/utils/token-helpers';

function getContractName(instanceInfo: InstanceInfo): string | undefined {
    return instanceInfo.name.substring(5);
}

// TODO: Move to helper file
async function fetchContractName(client: JsonRpcClient, index: bigint, subindex = 0n) {
    const instanceInfo = await client.getInstanceInfo({ index, subindex });
    if (!instanceInfo) {
        return undefined;
    }
    return getContractName(instanceInfo);
}

interface Props {
    setDetailsExpanded: (expanded: boolean) => void;
    cost?: bigint;
}

interface State extends SimpleTransferPayload {
    contractIndex: string;
    tokenId: string;
}

export default function ConfirmTokenTransfer({ setDetailsExpanded, cost }: Props) {
    const { t } = useTranslation('account');
    const { state } = useLocation();
    const { toAddress, amount, contractIndex, tokenId } = state as State;
    const [hash, setHash] = useState<string>();
    const selectedAddress = useAtomValue(selectedAccountAtom);
    const address = useMemo(() => selectedAddress, []);
    const key = usePrivateKey(address);
    const client = useAtomValue(jsonRpcClientAtom);
    const nav = useNavigate();
    const addToast = useSetAtom(addToastAtom);
    const contractName = useAsyncMemo(() => fetchContractName(client, BigInt(contractIndex)));

    const parameters = useMemo(
        () => address && getTokenTransferParameters(tokenId, amount.microGtuAmount, address, toAddress.address),
        [address]
    );

    const payload: UpdateContractPayload | undefined = useMemo(() => {
        if (!parameters || !contractName) {
            return undefined;
        }
        try {
            return getTokenTransferPayload(parameters, contractName, BigInt(contractIndex));
        } catch (e) {
            addToast((e as Error).message);
        }
        return undefined;
    }, [contractName]);

    useEffect(() => {
        if (selectedAddress !== address) {
            nav('../');
        }
    }, [selectedAddress]);

    useEffect(() => {
        setDetailsExpanded(false);
        return () => setDetailsExpanded(true);
    }, []);

    const send = async () => {
        if (!address || !key) {
            throw new Error('Missing address or key for selected account');
        }
        if (!payload) {
            throw new Error('Payload was not constructed');
        }
        const sender = new AccountAddress(address);
        const nonce = await client.getNextAccountNonce(sender);
        if (!nonce) {
            throw new Error('No nonce found for sender');
        }
        const header = {
            expiry: getDefaultExpiry(),
            sender,
            nonce: nonce.nonce,
        };

        if (!contractName) {
            throw new Error('unable to get contract name');
        }

        const transaction = { payload, header, type: AccountTransactionType.UpdateSmartContractInstance };
        const transactionHash = await sendTransaction(client, transaction, key);
        setHash(transactionHash);
    };

    if (!address || !payload) {
        return null;
    }

    return (
        <div className="w-full flex-column justify-space-between align-center">
            <TransactionReceipt
                transactionType={AccountTransactionType.UpdateSmartContractInstance}
                payload={payload}
                parameters={parameters}
                sender={address}
                cost={cost}
                hash={hash}
                className="send-ccd__receipt"
            />
            {!hash && (
                <div className="flex justify-center p-b-10 m-h-20">
                    <Button width="narrow" className="m-r-10" onClick={() => nav(`../`, { state })}>
                        {t('sendCcd.buttons.back')}
                    </Button>
                    <Button width="narrow" onClick={() => send().catch((e) => addToast(e.toString()))}>
                        {t('sendCcd.buttons.send')}
                    </Button>
                </div>
            )}
            {hash && (
                <div className="p-b-10">
                    <Button width="medium" className="m-b-10" onClick={() => nav(absoluteRoutes.home.account.path)}>
                        {t('sendCcd.buttons.finish')}
                    </Button>
                </div>
            )}
        </div>
    );
}
