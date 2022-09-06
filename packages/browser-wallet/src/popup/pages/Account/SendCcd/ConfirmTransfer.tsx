import React, { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSetAtom, useAtomValue } from 'jotai';
import { selectedAccountAtom } from '@popup/store/account';
import { AccountAddress, AccountTransactionType, SimpleTransferPayload } from '@concordium/web-sdk';
import { getDefaultExpiry, sendTransaction } from '@popup/shared/utils/transaction-helpers';
import { jsonRpcClientAtom } from '@popup/store/settings';
import { addToastAtom } from '@popup/state';
import { usePrivateKey } from '@popup/shared/utils/account-helpers';
import Button from '@popup/shared/Button';
import DisplaySimpleTransfer from '@popup/shared/TransactionReceipt/displayPayload/DisplaySimpleTransfer';
import { useLocation, useNavigate } from 'react-router-dom';
import { absoluteRoutes } from '@popup/constants/routes';
import TransactionReceipt from '@popup/shared/TransactionReceipt/TransactionReceipt';

interface Props {
    setDetailsExpanded: (expanded: boolean) => void;
    cost?: bigint;
}

interface State {
    payload: SimpleTransferPayload;
}

export default function ConfirmTransfer({ setDetailsExpanded, cost }: Props) {
    const { t } = useTranslation('account');
    const { state } = useLocation();
    const { payload } = state as State;
    const [hash, setHash] = useState<string>();
    const selectedAddress = useAtomValue(selectedAccountAtom);
    const address = useMemo(() => selectedAddress, []);
    const key = usePrivateKey(address);
    const client = useAtomValue(jsonRpcClientAtom);
    const nav = useNavigate();
    const addToast = useSetAtom(addToastAtom);

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
        const transaction = { payload, header, type: AccountTransactionType.SimpleTransfer };
        const transactionHash = await sendTransaction(client, transaction, key);
        setHash(transactionHash);
    };

    if (!address) {
        return null;
    }

    return (
        <div className="w-full flex-column justify-space-between align-center">
            <TransactionReceipt title={t('sendCcd.receiptTitle')} sender={address} cost={cost} hash={hash}>
                <DisplaySimpleTransfer payload={payload} />
            </TransactionReceipt>
            {!hash && (
                <div className="flex justify-center p-b-10 m-h-20">
                    <Button width="narrow" className="m-r-10" onClick={() => nav(`../`, { state: { payload } })}>
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
