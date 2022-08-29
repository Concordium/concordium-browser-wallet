import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAtomValue } from 'jotai';
import { selectedAccountAtom } from '@popup/store/account';
import { AccountAddress, AccountTransactionType, SimpleTransferPayload, TransactionExpiry } from '@concordium/web-sdk';
import { sendTransaction } from '@popup/shared/utils/transaction-helpers';
import { jsonRpcClientAtom } from '@popup/store/settings';
import { usePrivateKey } from '@popup/shared/utils/account-helpers';
import Button from '@popup/shared/Button';
import DisplaySimpleTransfer from '@popup/pages/SendTransaction/displayTransaction/DisplaySimpleTransfer';
import { useNavigate } from 'react-router-dom';
import { absoluteRoutes } from '@popup/constants/routes';
import { routes } from './routes';

interface Props {
    payload: SimpleTransferPayload | undefined;
    setDetailsExpanded: (expanded: boolean) => void;
}

export default function ConfirmTransfer({ payload, setDetailsExpanded }: Props) {
    const { t } = useTranslation('account');
    const [hash, setHash] = useState<string>();
    const address = useAtomValue(selectedAccountAtom);
    const key = usePrivateKey(address);
    const client = useAtomValue(jsonRpcClientAtom);
    const nav = useNavigate();

    useEffect(() => {
        setDetailsExpanded(false);
        return () => setDetailsExpanded(true);
    }, []);

    const send = async () => {
        if (!payload) {
            throw new Error('Missing payload');
        }
        if (!address || !key) {
            throw new Error('Missing address for selected account');
        }
        const nonce = await client.getNextAccountNonce(new AccountAddress(address));
        if (!nonce) {
            throw new Error('No nonce found for sender');
        }
        const header = {
            // TODO: add better default?
            expiry: new TransactionExpiry(new Date(Date.now() + 3600000)),
            sender: new AccountAddress(address),
            nonce: nonce.nonce,
        };
        const transaction = { payload, header, type: AccountTransactionType.SimpleTransfer };
        sendTransaction(client, transaction, key).then(setHash);
    };

    if (!payload) {
        return null;
    }

    return (
        <div className="flex-column justify-space-between align-center">
            <DisplaySimpleTransfer payload={payload} />
            {!hash && (
                <div className="flex w-full justify-center m-b-10">
                    <Button width="narrow" className="m-r-10" onClick={() => nav(`../${routes.create}`)}>
                        {t('sendCcd.buttons.cancel')}
                    </Button>
                    <Button width="narrow" onClick={send}>
                        {t('sendCcd.buttons.confirm')}
                    </Button>
                </div>
            )}
            {hash && (
                <Button width="narrow" className="m-b-10" onClick={() => nav(absoluteRoutes.home.account.path)}>
                    {t('sendCcd.buttons.finish')}
                </Button>
            )}
        </div>
    );
}
