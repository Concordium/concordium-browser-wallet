import React, { useCallback, useContext, useEffect, useMemo } from 'react';
import { BackgroundSendTransactionPayload } from '@shared/utils/types';
import { useLocation } from 'react-router-dom';
import { Trans, useTranslation } from 'react-i18next';
import { useAtomValue, useSetAtom } from 'jotai';
import {
    AccountTransactionPayload,
    AccountTransactionType,
    buildBasicAccountSigner,
    convertEnergyToMicroCcd,
    getEnergyCost,
    TokenUpdatePayload,
    Transaction,
} from '@concordium/web-sdk';
import { addToastAtom } from '@popup/state';
import { grpcClientAtom } from '@popup/store/settings';
import { fullscreenPromptContext } from '@popup/popupX/page-layouts/FullscreenPromptLayout';
import { useUpdateAtom } from 'jotai/utils';
import { addPendingTransactionAtom } from '@popup/store/transactions';
import { useBlockChainParameters } from '@popup/shared/BlockChainParametersProvider';
import { usePrivateKey } from '@popup/shared/utils/account-helpers';
import { parse, parsePayload } from '@shared/utils/payload-helpers';
import { SmartContractParameters } from '@concordium/browser-wallet-api-helpers';
import { Cbor, TokenOperationType } from '@concordium/web-sdk/plt';
import {
    createPendingTransactionFromAccountTransaction,
    getTransactionTypeName,
} from '@popup/shared/utils/transaction-helpers';
import DisplayTransactionPayload, {
    DisplayParameters,
} from '@popup/popupX/pages/prompts/SendTransaction/DisplayTransactionPayload';
import DisplaySingleTransferTokenUpdate from '@popup/popupX/pages/prompts/SendSponsoredTransaction/DisplaySingleTransferTokenUpdate';
import { displayUrl } from '@popup/shared/utils/string-helpers';
import { mapTransactionKindStringToTransactionType } from '@popup/shared/utils/wallet-proxy';
import { stringify } from '@wallet-api/util';
import Page from '@popup/popupX/shared/Page';
import Text from '@popup/popupX/shared/Text';
import Label from '@popup/popupX/shared/Label';
import Button from '@popup/popupX/shared/Button';
import Card from '@popup/popupX/shared/Card';
import Tooltip from '@popup/popupX/shared/Tooltip/Tooltip';
import QuestionIcon from '@assets/svgX/UiKit/Interface/circled-question-mark.svg';

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
    onSubmit(hash: string): void;
}

export default function SendSponsoredTransaction({ onSubmit, onReject }: Props) {
    const { state } = useLocation() as Location;
    const { t } = useTranslation('x', { keyPrefix: 'prompts.sendTransactionX' });
    const addToast = useSetAtom(addToastAtom);
    const client = useAtomValue(grpcClientAtom);
    const { withClose, onClose } = useContext(fullscreenPromptContext);
    const addPendingTransaction = useUpdateAtom(addPendingTransactionAtom);
    const chainParameters = useBlockChainParameters();

    const sponsoredTransaction = parse(state.payload.transaction);
    const sponsorAccount = sponsoredTransaction.header.sponsor.account;

    const { accountAddress, url } = state.payload;
    const key = usePrivateKey(accountAddress);

    const { type: transactionType, payload } = useMemo(
        () =>
            parsePayload(
                mapTransactionKindStringToTransactionType(sponsoredTransaction.payload.type) as AccountTransactionType,
                stringify(sponsoredTransaction.payload)
            ),
        [JSON.stringify(state.payload.transaction)]
    );
    const parameters = useMemo(
        () =>
            state.payload.parameters === undefined
                ? undefined
                : (sponsoredTransaction.parameters as SmartContractParameters),
        [sponsoredTransaction.parameters]
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

        const transaction = parse(state.payload.transaction);
        const signableSponsoredTransaction = Transaction.signableFromJSON(transaction);
        const signed = await Transaction.signAndFinalize(signableSponsoredTransaction, buildBasicAccountSigner(key));
        const hash = await client.sendTransaction(signed);

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
            .then(withClose(onSubmit))
            .catch((e) => addToast(e.message));
    };

    if (isSingleTransferTokenUpdate(transactionType, payload)) {
        return (
            <DisplaySingleTransferTokenUpdate
                url={url}
                sponsorAccount={sponsorAccount}
                payload={payload as TokenUpdatePayload}
                accountAddress={accountAddress}
                handleSubmit={handleSubmit}
                onSubmit={onSubmit}
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
                        <Text.Capture>{t('sponsored.transactionFee')}</Text.Capture>
                        <Label
                            icon={
                                <Tooltip
                                    title={t('sponsored.costCoveredBy')}
                                    text={sponsorAccount}
                                    className="tooltip"
                                    position="top"
                                >
                                    <QuestionIcon />
                                </Tooltip>
                            }
                            color="light-grey"
                            text={t('sponsored.freeTransaction')}
                            rightIcon
                        />
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
