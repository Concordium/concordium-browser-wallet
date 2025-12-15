import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TokenUpdatePayload, AccountInfo } from '@concordium/web-sdk';
import { Cbor, CborMemo, TokenOperationType, TokenTransferOperation } from '@concordium/web-sdk/plt';
import { WalletCredential } from '@shared/storage/types';
import { displaySplitAddress, useCredential, useIdentityName } from '@popup/shared/utils/account-helpers';
import Page from '@popup/popupX/shared/Page';
import Text from '@popup/popupX/shared/Text';
import Card from '@popup/popupX/shared/Card';
import Button from '@popup/popupX/shared/Button';
import { useAccountInfo } from '@popup/shared/AccountInfoListenerContext';
import { formatTokenAmount } from '@popup/popupX/shared/utils/helpers';
import { displayUrl } from '@popup/shared/utils/string-helpers';
import { logError } from '@shared/utils/log-helpers';
import Tooltip from '@popup/popupX/shared/Tooltip/Tooltip';
import Info from '@assets/svgX/info.svg';

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
    sponsoredAccount: string;
};

function TransferInfo({ tokenId, amount, sponsoredAccount }: TransferInfoProps) {
    const { t } = useTranslation('x', { keyPrefix: 'prompts.sendTransactionX' });
    return (
        <Card>
            <Card.Row className="amounts">
                <Text.Capture>{t('payload.amount')}</Text.Capture>
                <Text.Capture>
                    {amount} {tokenId}
                </Text.Capture>
            </Card.Row>
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
    sponsoredAccount: string;
    signHandler: () => void;
    rejectHandler: () => void;
};

export default function DisplaySingleTransferTokenUpdate({
    url,
    payload,
    accountAddress,
    sponsoredAccount,
    signHandler,
    rejectHandler,
}: DisplaySingleTransferProps) {
    const { t } = useTranslation('x', { keyPrefix: 'prompts.sendTransactionX' });
    const [webPageTitle, setWebPageTitle] = useState<string>('');
    const { tokenId, amount } = parsePayload(payload);
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
                <TransferInfo tokenId={tokenId} amount={amount} sponsoredAccount={sponsoredAccount} />
            </Page.Main>
            <Page.Footer>
                <Button.Main variant="secondary" label={t('reject')} onClick={rejectHandler} />
                <Button.Main label={t('approve')} onClick={signHandler} />
            </Page.Footer>
        </Page>
    );
}
