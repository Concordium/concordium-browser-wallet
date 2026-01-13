import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CcdAmount, TokenUpdatePayload, AccountInfo } from '@concordium/web-sdk';
import { Cbor, CborMemo, TokenOperationType, TokenTransferOperation } from '@concordium/web-sdk/plt';
import { WalletCredential } from '@shared/storage/types';
import { displaySplitAddress, useCredential, useIdentityName } from '@popup/shared/utils/account-helpers';
import { displayAsCcd, getPublicAccountAmounts } from 'wallet-common-helpers';
import Page from '@popup/popupX/shared/Page';
import Text from '@popup/popupX/shared/Text';
import Card from '@popup/popupX/shared/Card';
import Button from '@popup/popupX/shared/Button';
import { useAccountInfo } from '@popup/shared/AccountInfoListenerContext';
import { ToggleAdvanced } from '@popup/popupX/pages/prompts/SendTransaction/DisplayTransactionPayload';
import { formatTokenAmount } from '@popup/popupX/shared/utils/helpers';
import { displayUrl } from '@popup/shared/utils/string-helpers';
import { logError } from '@shared/utils/log-helpers';

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
    const { atDisposal } = getPublicAccountAmounts(accountInfo);
    const accountAtDisposal = formatTokenAmount(atDisposal, 6, 2, 2);
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
            <Card.Row>
                <Text.MainRegular>
                    {t('account.atDisposal')}
                    {accountAtDisposal} CCD
                </Text.MainRegular>
            </Card.Row>
        </Card>
    );
}

type TransferInfoProps = {
    tokenId: string;
    amount: string;
    recipient: string;
    cost?: bigint | string | CcdAmount.Type;
};

function TransferInfo({ tokenId, amount, recipient, cost }: TransferInfoProps) {
    const { t } = useTranslation('x', { keyPrefix: 'prompts.sendTransactionX' });

    return (
        <Card>
            <Card.RowDetails title={t('method')} value={t('operations.transfer')} />
            <Card.RowDetails title={t('payload.receiver')} value={recipient} />
            <Card.Row className="amounts">
                <Text.MainMedium>{t('payload.amount')}</Text.MainMedium>
                <Text.AdditionalSmall>
                    {amount} {tokenId}
                </Text.AdditionalSmall>
            </Card.Row>
            <Card.Row className="amounts">
                <Text.MainMedium>{t('payload.fee')}</Text.MainMedium>
                <Text.AdditionalSmall>
                    {cost ? displayAsCcd(cost, false, true) : t('payload.unknown')}
                </Text.AdditionalSmall>
            </Card.Row>
        </Card>
    );
}

type TransferInfoAdvancedProps = {
    payload: string;
    tokenId: string;
    accountAddress: string;
};

function TransferInfoAdvanced({ payload, tokenId, accountAddress }: TransferInfoAdvancedProps) {
    const { t } = useTranslation('x', { keyPrefix: 'prompts.sendTransactionX' });

    return (
        <div className="operations-list">
            <Card>
                <Card.Row>
                    <Text.MainMedium>{t('tokenUpdate')}</Text.MainMedium>
                </Card.Row>
                <Card.RowDetails title={t('payload.sender')} value={accountAddress} />
                <Card.RowDetails title={t('payload.tokenId')} value={tokenId} />
                <Card.RowDetails title={t('payload.operations')} value={payload} />
            </Card>
        </div>
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
    cost?: bigint | string | CcdAmount.Type;
    payload: TokenUpdatePayload;
    accountAddress: string;
    signHandler: () => void;
    rejectHandler: () => void;
};

export default function DisplaySingleTransferTokenUpdate({
    url,
    cost,
    payload,
    accountAddress,
    signHandler,
    rejectHandler,
}: DisplaySingleTransferProps) {
    const { t } = useTranslation('x', { keyPrefix: 'prompts.sendTransactionX' });
    const [webPageTitle, setWebPageTitle] = useState<string>('');
    const { tokenId, amount, recipient, stringifiedPayload } = parsePayload(payload);
    const credential = useCredential(accountAddress);

    useEffect(() => {
        getWebsiteTitle(url)
            .then((title) => {
                setWebPageTitle(title);
            })
            .catch((error) => logError(`Failed to get title: ${error}`));
    }, []);

    if (!credential) {
        return null;
    }

    return (
        <Page className="send-transaction-x single-transaction-token-update">
            <Page.Top heading={t('transferRequest')} />
            <Page.Main>
                <Text.Main>{webPageTitle}</Text.Main>
                <AccountInfoCard tokenId={tokenId} credential={credential} />
                <TransferInfo cost={cost} tokenId={tokenId} amount={amount} recipient={recipient} />
                <ToggleAdvanced />
                <TransferInfoAdvanced payload={stringifiedPayload} tokenId={tokenId} accountAddress={accountAddress} />
            </Page.Main>
            <Page.Footer>
                <Button.Main variant="secondary" label={t('reject')} onClick={rejectHandler} />
                <Button.Main label={t('approve')} onClick={signHandler} />
            </Page.Footer>
        </Page>
    );
}
