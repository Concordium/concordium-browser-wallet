import React, { useEffect, useState } from 'react';
import { useUpdateAtom } from 'jotai/utils';
import { useNavigate, useParams } from 'react-router-dom';
import { AccountAddress } from '@concordium/web-sdk';
import {
    TokenAccountInfo,
    TokenId,
    TokenInfo,
    TokenModuleState,
    TokenModuleAccountState,
} from '@concordium/web-sdk/plt';
import { absoluteRoutes, relativeRoutes, sendFundsRoute } from '@popup/popupX/constants/routes';
import Page from '@popup/popupX/shared/Page';
import Text from '@popup/popupX/shared/Text';
import Button from '@popup/popupX/shared/Button';
import { useTranslation } from 'react-i18next';
import Card from '@popup/popupX/shared/Card';
import Label from '@popup/popupX/shared/Label';
import { withSelectedCredential } from '@popup/popupX/shared/utils/hoc';
import { useAtomValue } from 'jotai';
import { addThousandSeparators, integerToFractional, pipe } from 'wallet-common-helpers';
import { trunctateSymbol } from '@shared/utils/token-helpers';
import { WalletCredential } from '@shared/storage/types';
import Arrow from '@assets/svgX/arrow-right.svg';
import Shield from '@assets/svgX/shield-square-crypto.svg';
import Stop from '@assets/svgX/circled-x-block-deny.svg';
import Check from '@assets/svgX/circled-check-done.svg';
import Notebook from '@assets/svgX/notebook.svg';
import PLTicon from '@assets/svgX/placeholder-crypto-token.svg';
import Eye from '@assets/svgX/eye-slash.svg';
import { grpcClientAtom } from '@popup/store/settings';
import { removeTokenFromCurrentAccountAtom } from '@popup/store/token';
import { useAccountInfo } from '@popup/shared/AccountInfoListenerContext/AccountInfoListenerContext';
import { cborDecode } from '@popup/popupX/shared/utils/helpers';
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

    return { pltInfo, renderedBalance, currentToken };
}

function getNavState(currentToken: TokenAccountInfo | undefined, pltSymbol: string) {
    return currentToken
        ? ({
              tokenType: 'plt',
              tokenSymbol: pltSymbol,
          } as SendFundsLocationState)
        : null;
}

function StatusLabel({ accountModuleState }: { accountModuleState: TokenModuleAccountState }) {
    const { t } = useTranslation('x', { keyPrefix: 'tokenDetails' });

    if (accountModuleState?.denyList) {
        return <Label icon={<Stop />} text={t('onDenyList')} color="red" />;
    }
    if (accountModuleState?.allowList) {
        return <Label icon={<Check />} text={t('onAllowList')} color="green" />;
    }
    return <Label icon={<Stop />} text={t('notOnAllowList')} color="yellow" />;
}

type Params = {
    pltSymbol: string;
};

function TokenDetails({ credential }: { credential: WalletCredential }) {
    const { t } = useTranslation('x', { keyPrefix: 'tokenDetails' });

    const nav = useNavigate();

    const { pltSymbol = '' } = useParams<Params>();
    const { pltInfo, renderedBalance, currentToken } = usePltInfoAndBalance(pltSymbol, credential);
    const remove = useUpdateAtom(removeTokenFromCurrentAccountAtom);
    if (!pltInfo) {
        return null;
    }
    const {
        state: { decimals, moduleState },
    } = pltInfo;

    const tokenModuleState = cborDecode(moduleState.toString()) as TokenModuleState;
    const accountModuleState = cborDecode(currentToken?.state?.moduleState?.toString()) as TokenModuleAccountState;

    const navToReceive = () => nav(absoluteRoutes.home.receive.path);
    const navToRaw = () => nav(relativeRoutes.home.token.plt.raw.path);
    const navToSend = () =>
        nav(sendFundsRoute(AccountAddress.fromBase58(credential.address)), {
            state: getNavState(currentToken, pltSymbol),
        });
    const removeToken = () => {
        remove({ contractIndex: pltSymbol, tokenId: pltSymbol });
        nav(-1);
    };

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
                </div>
                <Card>
                    <div className="token-details-x__token">
                        <span className="token-icon">
                            <PLTicon />
                        </span>
                        <Text.Main>{tokenModuleState.name}</Text.Main>
                    </div>
                    <div className="token-details-x__labels">
                        <Label icon={<Shield />} text={t('plt')} color="light-grey" />
                        <StatusLabel accountModuleState={accountModuleState} />
                    </div>
                    <Card.RowDetails
                        title={t('description')}
                        value={(tokenModuleState.description as string) || t('noDescription')}
                    />
                    <Card.RowDetails title={t('decimals')} value={`0 - ${decimals}`} />
                </Card>
                <Button.IconText icon={<Notebook />} label={t('showRawMetadata')} onClick={navToRaw} />
                <Button.IconText icon={<Eye />} label={t('hideToken')} onClick={removeToken} />
            </Page.Main>
        </Page>
    );
}

export default withSelectedCredential(TokenDetails);
