import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { relativeRoutes, absoluteRoutes, sendFundsRoute } from '@popup/popupX/constants/routes';
import Page from '@popup/popupX/shared/Page';
import Text from '@popup/popupX/shared/Text';
import Button from '@popup/popupX/shared/Button';
import { useTranslation } from 'react-i18next';
import Card from '@popup/popupX/shared/Card';
import { withSelectedCredential } from '@popup/popupX/shared/utils/hoc';
import { useFlattenedAccountTokens } from '@popup/pages/Account/Tokens/utils';
import { contractBalancesFamily, removeTokenFromCurrentAccountAtom } from '@popup/store/token';
import { useAtomValue } from 'jotai';
import { addThousandSeparators, integerToFractional, pipe } from 'wallet-common-helpers';
import { getMetadataDecimals, trunctateSymbol } from '@shared/utils/token-helpers';
import { useUpdateAtom } from 'jotai/utils';
import { WalletCredential } from '@shared/storage/types';
import Arrow from '@assets/svgX/arrow-right.svg';
import Clock from '@assets/svgX/clock.svg';
import Notebook from '@assets/svgX/notebook.svg';
import Eye from '@assets/svgX/eye-slash.svg';
import { AccountAddress, ContractAddress } from '@concordium/web-sdk';
import Img from '@popup/shared/Img';
import { SendFundsLocationState } from '../SendFunds/SendFunds';

const SUB_INDEX = '0';

type Params = {
    contractIndex: string;
};

function TokenDetails({ credential }: { credential: WalletCredential }) {
    const { t } = useTranslation('x', { keyPrefix: 'tokenDetails' });

    const { contractIndex = '' } = useParams<Params>();
    const tokenDetails = useFlattenedAccountTokens(credential).find((token) => token.contractIndex === contractIndex);
    const { id, metadata } = tokenDetails || { id: '', metadata: {} };
    const balancesAtom = contractBalancesFamily(credential?.address ?? '', tokenDetails?.contractIndex ?? '');
    const balance = useAtomValue(balancesAtom)[id];
    const renderBalance = pipe(integerToFractional(getMetadataDecimals(metadata)), addThousandSeparators);
    const remove = useUpdateAtom(removeTokenFromCurrentAccountAtom);

    const nav = useNavigate();
    const navToSend = () =>
        nav(sendFundsRoute(AccountAddress.fromBase58(credential.address)), {
            state: {
                tokenType: 'cis2',
                tokenAddress: { id, contract: ContractAddress.create(BigInt(contractIndex), 0) },
            } as SendFundsLocationState,
        });
    const navToReceive = () => nav(absoluteRoutes.home.receive.path);
    const navToTransactionLog = () =>
        nav(absoluteRoutes.home.transactionLog.path.replace(':account', credential.address));
    const navToRaw = () => nav(relativeRoutes.home.token.details.raw.path);
    const removeToken = () => {
        remove({ contractIndex, tokenId: id });
        nav(-1);
    };

    return (
        <Page className="token-details-x">
            <Page.Main>
                <Text.DynamicSize baseFontSize={32} baseTextLength={17} className="heading_big">
                    {renderBalance(balance)} {trunctateSymbol(metadata.symbol || '')}
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
                        <Img
                            className="token-icon"
                            src={metadata.thumbnail?.url || ''}
                            alt={metadata.symbol}
                            withDefaults
                        />
                        <Text.Main>{metadata.name}</Text.Main>
                    </div>
                    <Card.RowDetails title={t('description')} value={metadata.description} />
                    <Card.RowDetails title={t('decimals')} value={`0 - ${metadata.decimals}`} />
                    <Card.RowDetails title={t('indexSubindex')} value={`${contractIndex}, ${SUB_INDEX}`} />
                </Card>
                <Button.IconText icon={<Notebook />} label={t('showRawMetadata')} onClick={navToRaw} />
                <Button.IconText icon={<Eye />} label={t('hideToken')} onClick={removeToken} />
            </Page.Main>
        </Page>
    );
}

export default withSelectedCredential(TokenDetails);
