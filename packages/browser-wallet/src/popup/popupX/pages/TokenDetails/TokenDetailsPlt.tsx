import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AccountAddress } from '@concordium/web-sdk';
import { TokenId, TokenInfo } from '@concordium/web-sdk/plt';
import { absoluteRoutes, sendFundsRoute } from '@popup/popupX/constants/routes';
import Page from '@popup/popupX/shared/Page';
import Text from '@popup/popupX/shared/Text';
import Button from '@popup/popupX/shared/Button';
import { useTranslation } from 'react-i18next';
import Card from '@popup/popupX/shared/Card';
import { withSelectedCredential } from '@popup/popupX/shared/utils/hoc';
import { useAtomValue } from 'jotai';
import { addThousandSeparators, integerToFractional, pipe } from 'wallet-common-helpers';
import { trunctateSymbol } from '@shared/utils/token-helpers';
import { WalletCredential } from '@shared/storage/types';
import Arrow from '@assets/svgX/arrow-right.svg';
import Clock from '@assets/svgX/clock.svg';
import { grpcClientAtom } from '@popup/store/settings';
import { useAccountInfo } from '@popup/shared/AccountInfoListenerContext/AccountInfoListenerContext';
import { formatTokenAmount } from '@popup/popupX/shared/utils/helpers';
import { SendFundsLocationState } from '@popup/popupX/pages/SendFunds/SendFunds';

function usePltInfoAndBalance(pltSymbol: string, credential: WalletCredential) {
    const client = useAtomValue(grpcClientAtom);
    const accountInfo = useAccountInfo(credential);
    const [pltInfo, setPltInfo] = useState<TokenInfo>();
    useEffect(() => {
        client.getTokenInfo(TokenId.fromString(pltSymbol)).then((tokenDetails) => {
            setPltInfo(tokenDetails);
        });
    }, []);

    const currentToken = accountInfo?.accountTokens.find((accountToken) => accountToken.id.toString() === pltSymbol);
    const balance = currentToken?.state.balance || { decimals: 0, value: 0n };
    const renderedBalance = pipe(integerToFractional(balance.decimals), addThousandSeparators)(balance.value);

    return { pltInfo, renderedBalance };
}

type Params = {
    pltSymbol: string;
};

function TokenDetails({ credential }: { credential: WalletCredential }) {
    const { t } = useTranslation('x', { keyPrefix: 'tokenDetails' });

    const nav = useNavigate();

    const { pltSymbol = '' } = useParams<Params>();
    const { pltInfo, renderedBalance } = usePltInfoAndBalance(pltSymbol, credential);
    if (!pltInfo) {
        return null;
    }
    const {
        state: { moduleRef, decimals, totalSupply },
    } = pltInfo;

    const navToSend = () =>
        nav(sendFundsRoute(AccountAddress.fromBase58(credential.address)), {
            state: {
                tokenType: 'plt',
                tokenSymbol: pltSymbol,
            } as SendFundsLocationState,
        });
    const navToReceive = () => nav(absoluteRoutes.home.receive.path);
    const navToTransactionLog = () =>
        nav(absoluteRoutes.home.transactionLog.path.replace(':account', credential.address));

    return (
        <Page className="token-details-x">
            <Page.Main>
                <Text.DynamicSize baseFontSize={32} baseTextLength={17} className="heading_big plt">
                    {renderedBalance} {trunctateSymbol(pltSymbol)}
                </Text.DynamicSize>
                <div className="token-details-x__action-buttons">
                    <Button.IconTile
                        icon={<Arrow />}
                        label={t('receive')}
                        onClick={() => navToReceive()}
                        className="receive"
                    />
                    <Button.IconTile icon={<Arrow />} label={t('send')} onClick={() => navToSend()} className="send" />
                    <Button.IconTile icon={<Clock />} label={t('activity')} onClick={() => navToTransactionLog()} />
                </div>
                <Card>
                    <div className="token-details-x__token">
                        <span className="token-icon plt">PLT</span>
                        <Text.Main>{pltSymbol}</Text.Main>
                    </div>
                    <Card.RowDetails title={t('totalSupply')} value={formatTokenAmount(totalSupply.value, decimals)} />
                    <Card.RowDetails title={t('moduleRef')} value={moduleRef.toString()} />
                    <Card.RowDetails title={t('decimals')} value={`0 - ${decimals}`} />
                </Card>
            </Page.Main>
        </Page>
    );
}

export default withSelectedCredential(TokenDetails);
