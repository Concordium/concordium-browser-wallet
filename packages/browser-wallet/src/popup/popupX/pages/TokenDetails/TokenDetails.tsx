import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { relativeRoutes } from '@popup/popupX/constants/routes';
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
import FileText from '@assets/svgX/file-text.svg';
import Notebook from '@assets/svgX/notebook.svg';
import Eye from '@assets/svgX/eye-slash.svg';

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
    const navToSend = () => nav(`../${relativeRoutes.home.send.path}`);
    const navToReceive = () => nav(`../${relativeRoutes.home.receive.path}`);
    const navToTransactionLog = () => nav(`../${relativeRoutes.home.transactionLog.path}`);
    const navToRaw = () => nav(relativeRoutes.home.token.details.raw.path);
    const removeToken = () => {
        remove({ contractIndex, tokenId: id });
        nav(-1);
    };

    return (
        <Page className="token-details-x">
            <Page.Main>
                <Text.HeadingBig>
                    {renderBalance(balance)} {trunctateSymbol(metadata.symbol || '')}
                </Text.HeadingBig>
                <div className="token-details-x__action-buttons">
                    <Button.IconTile
                        icon={<Arrow />}
                        label={t('receive')}
                        onClick={() => navToReceive()}
                        className="receive"
                    />
                    <Button.IconTile icon={<Arrow />} label={t('send')} onClick={() => navToSend()} className="send" />
                    <Button.IconTile
                        icon={<FileText />}
                        label={t('transactions')}
                        onClick={() => navToTransactionLog()}
                    />
                </div>
                <Card>
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
