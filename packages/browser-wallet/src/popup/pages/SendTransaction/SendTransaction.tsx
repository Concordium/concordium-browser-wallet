import React, { useContext, useCallback } from 'react';
import { Buffer } from 'buffer/';
import { useAtomValue } from 'jotai';
import { fullscreenPromptContext } from '@popup/page-layouts/FullscreenPromptLayout';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import {
    SimpleTransferPayload,
    UpdateContractPayload,
    AccountTransactionType,
    JsonRpcClient,
    HttpProvider,
    AccountAddress,
    buildBasicAccountSigner,
    signTransaction,
    TransactionExpiry,
    serializeUpdateContractParameters,
    AccountTransactionPayload,
} from '@concordium/web-sdk';
import { selectedAccountAtom } from '@popup/store/account';
import { jsonRpcUrlAtom, credentialsAtom } from '@popup/store/settings';
import { absoluteRoutes } from '@popup/constants/routes';
import DisplayUpdateContract from './displayTransaction/DisplayUpdateContract';
import DisplaySimpleTransfer from './displayTransaction/DisplaySimpleTransfer';

interface Location {
    state:
        | {
              transactionType: AccountTransactionType.SimpleTransfer;
              transactionPayload: SimpleTransferPayload;
          }
        | {
              transactionType: AccountTransactionType.UpdateSmartContractInstance;
              transactionPayload: Omit<UpdateContractPayload, 'parameter'>;
              parameter: Record<string, unknown> | undefined;
              schema: string;
          };
}

export default function SendTransaction() {
    const navigate = useNavigate();
    const { state } = useLocation() as Location;
    const { t } = useTranslation('sendTransaction');
    const address = useAtomValue(selectedAccountAtom);
    const creds = useAtomValue(credentialsAtom);
    const url = useAtomValue(jsonRpcUrlAtom);
    const { withClose } = useContext(fullscreenPromptContext);

    const sendTransaction = useCallback(async () => {
        if (!url || !address) {
            return false;
        }

        // TODO: pick port
        const client = new JsonRpcClient(new HttpProvider(url, 9095));
        const sender = new AccountAddress(address);
        const nonce = await client.getNextAccountNonce(sender);

        if (!nonce) {
            return false;
        }

        let payload: AccountTransactionPayload;
        if (state.transactionType === AccountTransactionType.UpdateSmartContractInstance) {
            const [contractName, functionName] = state.transactionPayload.receiveName.split('.');
            payload = {
                ...state.transactionPayload,
                parameter: state.parameter
                    ? serializeUpdateContractParameters(
                          contractName,
                          functionName,
                          state.parameter,
                          // TODO: encoding
                          Buffer.from(state.schema, 'utf8')
                      )
                    : Buffer.alloc(0),
            };
        } else {
            payload = state.transactionPayload;
        }

        const header = {
            expiry: new TransactionExpiry(new Date(Date.now() + 3600000)),
            sender,
            nonce: nonce.nonce,
        };
        const transaction = { payload, header, type: state.transactionType };

        const key = creds.find((c) => c.address === address)?.key;
        if (!key) {
            return false;
        }

        const signature = await signTransaction(transaction, buildBasicAccountSigner(key));
        try {
            const result = await client.sendAccountTransaction(transaction, signature);
            navigate(absoluteRoutes.home.path);
            return result;
        } catch (e) {
            // TODO: Display error instead of doing nothing
            return false;
        }
    }, [state.transactionType, state.transactionPayload, address]);

    return (
        <>
            <div>{t('description')}</div>
            <h5>{t('sender')}:</h5>
            <p className="send-transaction__address">{address}</p>
            {state.transactionType === AccountTransactionType.SimpleTransfer && (
                <DisplaySimpleTransfer payload={state.transactionPayload} />
            )}
            {state.transactionType === AccountTransactionType.UpdateSmartContractInstance && (
                <DisplayUpdateContract payload={state.transactionPayload} parameter={state.parameter} />
            )}
            <button type="button" onClick={withClose(sendTransaction)}>
                {t('submit')}
            </button>
        </>
    );
}
