import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    AccountInfo,
    HexString,
    isRejectTransaction,
    isSuccessTransaction,
    TokenUpdatePayload,
    TransactionHash,
    TransactionSummaryType,
} from '@concordium/web-sdk';
import { Cbor, CborMemo, TokenOperationType, TokenTransferOperation } from '@concordium/web-sdk/plt';
import { WalletCredential } from '@shared/storage/types';
import { displaySplitAddress, useCredential, useIdentityName } from '@popup/shared/utils/account-helpers';
import { useAccountInfo } from '@popup/shared/AccountInfoListenerContext';
import { formatTokenAmount } from '@popup/popupX/shared/utils/helpers';
import { displayUrl } from '@popup/shared/utils/string-helpers';
import { logError } from '@shared/utils/log-helpers';
import { LoaderInline } from '@popup/popupX/shared/Loader';
import { fullscreenPromptContext } from '@popup/popupX/page-layouts/FullscreenPromptLayout';
import { useAtomValue, useSetAtom } from 'jotai';
import { addToastAtom } from '@popup/state';
import { grpcClientAtom } from '@popup/store/settings';
import { useAsyncMemo } from 'wallet-common-helpers';
import Page from '@popup/popupX/shared/Page';
import Text from '@popup/popupX/shared/Text';
import Card from '@popup/popupX/shared/Card';
import Button from '@popup/popupX/shared/Button';
import Label from '@popup/popupX/shared/Label';
import Tooltip from '@popup/popupX/shared/Tooltip/Tooltip';
import QuestionIcon from '@assets/svgX/UiKit/Interface/circled-question-mark.svg';
import CheckCircle from '@assets/svgX/check-circle.svg';
import Cross from '@assets/svgX/close.svg';

interface Status {
    type?: 'success' | 'failure';
}

function TransactionStatusIcon({ status }: { status?: Status }) {
    const { t } = useTranslation('x', { keyPrefix: 'prompts.sendTransactionX.sponsored' });
    switch (status?.type) {
        case undefined: {
            return (
                <>
                    <LoaderInline />
                    <Text.Capture className="status pending">{t('pending.label')}</Text.Capture>
                </>
            );
        }
        case 'success': {
            return (
                <>
                    <CheckCircle />
                    <Text.Capture className="status success">{t('success.label')}</Text.Capture>
                </>
            );
        }
        case 'failure': {
            return (
                <>
                    <Cross className="submitted-tx__failed-icon" />
                    <Text.Capture className="status failure">{t('failure.label')}</Text.Capture>
                </>
            );
        }
        default:
            throw new Error('Unexpected status');
    }
}

type TransactionStatusProps = {
    status?: Status;
    amount?: string | number;
    sponsorAccount?: string;
    tokenName?: string;
};

function TransactionStatus({ status, amount, sponsorAccount, tokenName }: TransactionStatusProps) {
    const { t } = useTranslation('x', { keyPrefix: 'prompts.sendTransactionX.sponsored' });

    return (
        <>
            <TransactionStatusIcon status={status} />
            <Text.Capture>{t('tokenNameAmount', { tokenName })}</Text.Capture>
            <Text.HeadingLarge>{amount}</Text.HeadingLarge>
            <Text.Label className="fee">{t('transactionFee')}:</Text.Label>
            <Label
                icon={
                    <Tooltip title={t('costCoveredBy')} text={sponsorAccount} className="tooltip" position="top">
                        <QuestionIcon />
                    </Tooltip>
                }
                color="light-grey"
                text={t('freeTransaction')}
                rightIcon
            />
        </>
    );
}

const TX_TIMEOUT = 60 * 1000; // 1 minute

interface SubmitStatusProps {
    sponsorAccount: string;
    tokenSymbol: string;
    amount: string;
    transactionHash: HexString;
}

function SubmitStatus({ sponsorAccount, tokenSymbol, amount, transactionHash }: SubmitStatusProps) {
    const { t } = useTranslation('x', { keyPrefix: 'prompts.sendTransactionX' });
    const { withClose } = useContext(fullscreenPromptContext);
    const grpc = useAtomValue(grpcClientAtom);

    const status = useAsyncMemo(
        async (): Promise<Status> => {
            try {
                const outcome = await grpc.waitForTransactionFinalization(
                    TransactionHash.fromHexString(transactionHash),
                    TX_TIMEOUT
                );

                if (!outcome.summary) {
                    throw Error('Unexpected transaction type');
                }
                if (isRejectTransaction(outcome.summary)) {
                    return { type: 'failure' };
                }
                if (
                    isSuccessTransaction(outcome.summary) &&
                    outcome.summary.type === TransactionSummaryType.AccountTransaction
                ) {
                    return { type: 'success' };
                }
            } catch (e) {
                return { type: 'failure' };
            }

            return {};
        },
        undefined,
        [transactionHash, grpc]
    );

    return (
        <Page className="send-transaction-x submitted-tx">
            <Page.Main>
                <Card type="transparent" className="submitted-tx__card">
                    <TransactionStatus
                        status={status}
                        sponsorAccount={sponsorAccount}
                        amount={amount}
                        tokenName={tokenSymbol}
                    />
                </Card>
            </Page.Main>
            <Page.Footer>
                <Button.Main label={t('sponsored.return')} onClick={withClose(() => {})} />
            </Page.Footer>
        </Page>
    );
}

async function getWebsiteTitle(url: string): Promise<string> {
    try {
        const { origin } = new URL(url);
        const response = await fetch(origin);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const titleElement = doc.querySelector('title');
        return titleElement ? titleElement.innerText : displayUrl(url);
    } catch (error) {
        logError(`Error fetching or parsing URL: ${error}`);
        return displayUrl(url);
    }
}

const getPltBalance = (accountInfo: AccountInfo | undefined, tokenId: string) =>
    accountInfo?.accountTokens.find((token) => token.id.toString() === tokenId);

function AccountInfoCard({ credential, tokenId }: { credential: WalletCredential; tokenId: string }) {
    const { t } = useTranslation('x', { keyPrefix: 'prompts.sendTransactionX' });
    const accountInfo = useAccountInfo(credential);
    const identityName = useIdentityName(credential);
    const { credName, address } = credential;
    const {
        state: {
            balance: { value, decimals },
        },
    } = getPltBalance(accountInfo, tokenId) || { state: { balance: { value: 0n, decimals: 0 } } };
    const pltFormated = formatTokenAmount(value, decimals, 2, 2);

    return (
        <Card type="gradient">
            <Card.Row>
                {credName && <Text.Main>{credName}</Text.Main>}
                <Text.MainRegular>{displaySplitAddress(address)}</Text.MainRegular>
            </Card.Row>
            <Card.Row>
                <Text.MainRegular>{identityName}</Text.MainRegular>
            </Card.Row>
            <span className="divider" />
            <Card.Row>
                <Text.Main>
                    {t('account.balance')}
                    {pltFormated} {tokenId}
                </Text.Main>
            </Card.Row>
        </Card>
    );
}

type TransferInfoProps = {
    tokenId: string;
    amount: string;
    sponsorAccount: string;
};

function TransferInfo({ tokenId, amount, sponsorAccount }: TransferInfoProps) {
    const { t } = useTranslation('x', { keyPrefix: 'prompts.sendTransactionX' });
    return (
        <Card>
            <Card.Row className="amounts">
                <Text.MainMedium>{t('payload.amount')}</Text.MainMedium>
                <Text.AdditionalSmall>
                    {amount} {tokenId}
                </Text.AdditionalSmall>
            </Card.Row>
            <Card.Row className="amounts sponsored-fee">
                <Text.MainMedium>{t('sponsored.transactionFee')}</Text.MainMedium>
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
        </Card>
    );
}

const parsePayload = (payload: TokenUpdatePayload) => {
    const { tokenId, operations } = payload;
    const decodedOperations = Cbor.decode(operations) as TokenTransferOperation[];
    const { amount, recipient, memo: encodedMemo } = decodedOperations[0][TokenOperationType.Transfer];
    const decodedMemo = encodedMemo ? CborMemo.parse(encodedMemo as CborMemo.Type) : undefined;

    const stringifiedPayload = JSON.stringify(
        [{ [TokenOperationType.Transfer]: { amount, recipient, memo: decodedMemo } }],
        null,
        2
    );
    return {
        tokenId: tokenId.toString(),
        amount: amount.toString(),
        recipient: recipient.toString(),
        stringifiedPayload,
    };
};

type DisplaySingleTransferProps = {
    url: string;
    payload: TokenUpdatePayload;
    accountAddress: string;
    sponsorAccount: string;
    onSubmit: (hash: string) => void;
    handleSubmit: () => Promise<string>;
    rejectHandler: () => void;
};

export default function DisplaySingleTransferTokenUpdate({
    url,
    payload,
    accountAddress,
    sponsorAccount,
    onSubmit,
    handleSubmit,
    rejectHandler,
}: DisplaySingleTransferProps) {
    const { t } = useTranslation('x', { keyPrefix: 'prompts.sendTransactionX' });
    const addToast = useSetAtom(addToastAtom);
    const [webPageTitle, setWebPageTitle] = useState<string>('');
    const [transactionHash, setTransactionHash] = useState<string>('');
    const { tokenId, amount } = parsePayload(payload);
    const credential = useCredential(accountAddress);

    useEffect(() => {
        getWebsiteTitle(url)
            .then((title) => {
                setWebPageTitle(title);
            })
            .catch((error) => logError(`Failed to get title: ${error}`));
    }, []);

    const signHandler = () => {
        handleSubmit()
            .then((hash) => {
                setTransactionHash(hash);
                onSubmit(hash);
            })
            .catch((e) => addToast(e.message));
    };

    if (!credential) {
        return null;
    }

    if (transactionHash) {
        return (
            <SubmitStatus
                tokenSymbol={tokenId}
                amount={amount}
                sponsorAccount={sponsorAccount}
                transactionHash={transactionHash}
            />
        );
    }

    return (
        <Page className="send-transaction-x single-transaction-token-update">
            <Page.Top heading={t('transferRequest')} />
            <Page.Main>
                <Text.Main>{webPageTitle}</Text.Main>
                <AccountInfoCard tokenId={tokenId} credential={credential} />
                <TransferInfo tokenId={tokenId} amount={amount} sponsorAccount={sponsorAccount} />
            </Page.Main>
            <Page.Footer>
                <Button.Main variant="secondary" label={t('reject')} onClick={rejectHandler} />
                <Button.Main label={t('approve')} onClick={signHandler} />
            </Page.Footer>
        </Page>
    );
}
