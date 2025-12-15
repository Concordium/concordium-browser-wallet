import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { BackgroundSendTransactionPayload } from '@shared/utils/types';
import { useLocation } from 'react-router-dom';
import { Trans, useTranslation } from 'react-i18next';
import { useAtomValue, useSetAtom } from 'jotai';
import { addToastAtom } from '@popup/state';
import { grpcClientAtom } from '@popup/store/settings';
import { fullscreenPromptContext } from '@popup/popupX/page-layouts/FullscreenPromptLayout';
import { useUpdateAtom } from 'jotai/utils';
import { addPendingTransactionAtom } from '@popup/store/transactions';
import { useBlockChainParameters } from '@popup/shared/BlockChainParametersProvider';
import { usePrivateKey } from '@popup/shared/utils/account-helpers';
import { parse, parsePayload } from '@shared/utils/payload-helpers';
import * as JSONBig from 'json-bigint';
import { SmartContractParameters } from '@concordium/browser-wallet-api-helpers';
import {
    AccountAddress,
    AccountTransactionType,
    TokenUpdatePayload,
    convertEnergyToMicroCcd,
    getEnergyCost,
    AccountTransactionPayload,
    Transaction,
    buildBasicAccountSigner,
} from '@concordium/web-sdk';
import { Cbor, TokenOperationType } from '@concordium/web-sdk/plt';
import {
    createPendingTransactionFromAccountTransaction,
    getTransactionTypeName,
} from '@popup/shared/utils/transaction-helpers';
import Page from '@popup/popupX/shared/Page';
import Text from '@popup/popupX/shared/Text';
import { displayUrl } from '@popup/shared/utils/string-helpers';
import Button from '@popup/popupX/shared/Button';
import Card from '@popup/popupX/shared/Card';
import DisplayTransactionPayload, {
    DisplayParameters,
} from '@popup/popupX/pages/prompts/SendSponsoredTransaction/DisplayTransactionPayload';
import DisplaySingleTransferTokenUpdate from '@popup/popupX/pages/prompts/SendSponsoredTransaction/DisplaySingleTransferTokenUpdate';
import FullscreenNotice from '@popup/popupX/shared/FullscreenNotice';
import Tooltip from '@popup/popupX/shared/Tooltip/Tooltip';
import Info from '@assets/svgX/info.svg';
import { LoaderInline } from '@popup/popupX/shared/Loader';
import CheckCircle from '@assets/svgX/check-circle.svg';
import Cross from '@assets/svgX/close.svg';

const isSingleTransferTokenUpdate = (transactionType: AccountTransactionType, payload: AccountTransactionPayload) => {
    const isTokenUpdate = transactionType === AccountTransactionType.TokenUpdate;
    if (isTokenUpdate) {
        const { operations } = payload as TokenUpdatePayload;
        const decodedOperations = Cbor.decode(operations) as object[];
        return decodedOperations.length === 1 && Object.keys(decodedOperations[0])[0] === TokenOperationType.Transfer;
    }
    return false;
};

interface Location {
    state: {
        payload: BackgroundSendTransactionPayload;
    };
}

interface Props {
    onReject(): void;
}

type TransactionStatusProps = {
    success?: boolean | undefined;
    amount?: string | number;
    sponsoredAccount?: string;
    tokenName?: string;
};

function TransactionStatus({ success, amount, sponsoredAccount, tokenName }: TransactionStatusProps) {
    const { t } = useTranslation('x', { keyPrefix: 'submittedTransaction' });

    let icon: JSX.Element;
    switch (success) {
        case undefined: {
            icon = <LoaderInline />;
            break;
        }
        case true: {
            icon = <CheckCircle />;
            break;
        }
        case false: {
            icon = <Cross className="submitted-tx__failed-icon" />;
            break;
        }
        default:
            throw new Error('Unexpected status');
    }

    return (
        <>
            {icon}
            <Text.Capture>Amount ({tokenName})</Text.Capture>
            <Text.HeadingLarge>{amount}</Text.HeadingLarge>
            <Text.Capture>
                <span className="free-transaction-btn">
                    <Tooltip
                        title="Transaction cost covered by:"
                        text={sponsoredAccount}
                        className="tooltip"
                        position="top"
                    >
                        Free Transaction
                    </Tooltip>
                </span>
            </Text.Capture>

            {success === true && <Text.Capture>{t('success.label')}</Text.Capture>}
            {success === false && <Text.Capture>{t('failure.label')}</Text.Capture>}
            {success === undefined && <Text.Capture>{t('pending.label')}</Text.Capture>}
        </>
    );
}

export default function SendSponsoredTransaction({ onReject }: Props) {
    const { state } = useLocation() as Location;
    const { t } = useTranslation('x', { keyPrefix: 'prompts.sendTransactionX' });
    const addToast = useSetAtom(addToastAtom);
    const client = useAtomValue(grpcClientAtom);
    const { withClose, onClose } = useContext(fullscreenPromptContext);
    const addPendingTransaction = useUpdateAtom(addPendingTransactionAtom);
    const chainParameters = useBlockChainParameters();

    const [showNoChanges, setShowNoChanges] = useState(false);

    const payloadSponsored = JSON.parse(state.payload.payloadSponsored);
    const sponsoredAccount = payloadSponsored.header.sponsor.account;
    const tokenSymbol = payloadSponsored.payload.tokenId;

    const { accountAddress, url } = state.payload;
    const key = usePrivateKey(accountAddress);

    const { type: transactionType, payload } = useMemo(
        () =>
            parsePayload(
                state.payload.type,
                state.payload.payload,
                state.payload.parameters,
                state.payload.schema,
                state.payload.schemaVersion
            ),
        [JSON.stringify(state.payload)]
    );
    const parameters = useMemo(
        () =>
            state.payload.parameters === undefined
                ? undefined
                : (JSONBig.parse(state.payload.parameters) as SmartContractParameters),
        [state.payload.parameters]
    );

    const cost = useMemo(() => {
        if (chainParameters) {
            const energy = getEnergyCost(transactionType, payload);
            return convertEnergyToMicroCcd(energy, chainParameters);
        }
        return undefined;
    }, [transactionType, chainParameters]);

    useEffect(() => onClose(onReject), [onClose, onReject]);

    const handleSubmit = useCallback(async () => {
        if (!accountAddress) {
            throw new Error(t('errors.missingAccount'));
        }
        if (!key) {
            throw new Error(t('errors.missingKey'));
        }

        setShowNoChanges(true);

        const sender = AccountAddress.fromBase58(accountAddress);

        const nonce = await client.getNextAccountNonce(sender);

        if (!nonce) {
            throw new Error(t('errors.missingNonce'));
        }

        // ToDo magic happens here
        const transaction = parse(state.payload.payloadSponsored);
        const sponsoredTransaction = Transaction.signableFromJSON(transaction);
        const signed = await Transaction.signAndFinalize(sponsoredTransaction, buildBasicAccountSigner(key));
        const hash = await client.sendTransaction(signed);
        // end of magic

        const pending = createPendingTransactionFromAccountTransaction(
            transaction,
            hash.toString(),
            cost?.microCcdAmount
        );
        await addPendingTransaction(pending);
        return hash.toString();
    }, [payload, key, cost]);

    const rejectHandler = withClose(onReject);

    const signHandler = () => {
        handleSubmit()
            // .then(withClose(onSubmit))
            .catch((e) => addToast(e.message));
    };

    if (showNoChanges) {
        return (
            <FullscreenNotice open={showNoChanges} onClose={() => setShowNoChanges(false)}>
                <Page className="submitted-tx">
                    <Card type="transparent" className="submitted-tx__card">
                        <TransactionStatus
                            success
                            sponsoredAccount={sponsoredAccount}
                            amount="1.00"
                            tokenName={tokenSymbol}
                        />
                    </Card>
                </Page>
            </FullscreenNotice>
        );
    }

    if (isSingleTransferTokenUpdate(transactionType, payload)) {
        return (
            <DisplaySingleTransferTokenUpdate
                url={url}
                sponsoredAccount={sponsoredAccount}
                payload={payload as TokenUpdatePayload}
                accountAddress={accountAddress}
                signHandler={signHandler}
                rejectHandler={rejectHandler}
            />
        );
    }

    return (
        <Page className="send-transaction-x">
            <Page.Top heading={t('signRequest')} />
            <Page.Main>
                <Text.Main>
                    <Trans
                        ns="x"
                        i18nKey="prompts.sendTransactionX.signTransaction"
                        components={{ 1: <span className="white" /> }}
                        values={{ dApp: displayUrl(url) }}
                    />
                </Text.Main>
                <Card>
                    <Card.Row>
                        <Text.MainMedium>{getTransactionTypeName(transactionType)}</Text.MainMedium>
                    </Card.Row>
                    <Card.RowDetails title={t('payload.sender')} value={accountAddress} />
                    <DisplayTransactionPayload type={transactionType} payload={payload} />
                    <Card.Row className="amounts">
                        <Text.Capture>{t('payload.fee')}</Text.Capture>
                        <span className="free-transaction-btn">
                            <Tooltip
                                title="Transaction cost covered by:"
                                text={sponsoredAccount}
                                className="tooltip"
                                position="top"
                            >
                                Free Transaction <Info />
                            </Tooltip>
                        </span>
                    </Card.Row>
                    <DisplayParameters parameters={parameters} />
                </Card>
            </Page.Main>
            <Page.Footer>
                <Button.Main variant="secondary" label={t('reject')} onClick={rejectHandler} />
                <Button.Main label={t('sign')} onClick={signHandler} />
            </Page.Footer>
        </Page>
    );
}
