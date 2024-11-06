import React from 'react';
import Page from '@popup/popupX/shared/Page';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { withSelectedCredential } from '@popup/popupX/shared/utils/hoc';
import { WalletCredential } from '@shared/storage/types';
import { useFlattenedAccountTokens } from '@popup/pages/Account/Tokens/utils';
import Button from '@popup/popupX/shared/Button';
import Code from '@assets/svgX/code.svg';
import EyeSlash from '@assets/svgX/eye-slash.svg';
import Text from '@popup/popupX/shared/Text';
import Img from '@popup/shared/Img';
import { contractBalancesFamily, removeTokenFromCurrentAccountAtom } from '@popup/store/token';
import { useAtomValue } from 'jotai';
import { useUpdateAtom } from 'jotai/utils';
import { relativeRoutes } from '@popup/popupX/constants/routes';

const SUB_INDEX = '0';

type Params = {
    contractIndex: string;
    id: string;
};

function useSelectedToken(credential: WalletCredential) {
    const { contractIndex, id } = useParams<Params>();
    const token = useFlattenedAccountTokens(credential).find((t) => t.contractIndex === contractIndex && t.id === id);
    return token;
}

function useRemoveToken() {
    const { contractIndex, id } = useParams<Params>();
    const nav = useNavigate();
    const removeToken = useUpdateAtom(removeTokenFromCurrentAccountAtom);
    if (!contractIndex || !id) return () => {};

    return () => {
        removeToken({ contractIndex, tokenId: id });
        nav(-1);
    };
}

type InfoRowProps = {
    title: string;
    value?: string;
};

function InfoRow({ title, value }: InfoRowProps) {
    return (
        <span className="info-row">
            <Text.Capture>{title}</Text.Capture>
            <Text.Capture>{value}</Text.Capture>
        </span>
    );
}

function NftDetails({ credential }: { credential: WalletCredential }) {
    const nav = useNavigate();
    const { t } = useTranslation('x', { keyPrefix: 'nft' });
    const token = useSelectedToken(credential);
    const removeToken = useRemoveToken();
    const { contractIndex, id, metadata } = token || { id: '', contractIndex: '' };
    const balancesAtom = contractBalancesFamily(credential?.address ?? '', token?.contractIndex ?? '');
    const balance = useAtomValue(balancesAtom)[id];

    const navToRaw = () => nav(relativeRoutes.settings.nft.details.raw.path);

    return (
        <Page className="nft-details-x">
            <Page.Top heading={metadata?.name}>
                <Button.Icon icon={<Code />} onClick={navToRaw} />
                <Button.Icon icon={<EyeSlash />} onClick={removeToken} />
            </Page.Top>
            <Page.Main>
                <InfoRow title={t('ownership')} value={balance === 0n ? t('unownedUnique') : t('ownedUnique')} />
                <InfoRow title={t('contract')} value={`${contractIndex}, ${SUB_INDEX}`} />
                <InfoRow title={t('tokenId')} value={id} />
                <Img
                    className="details-img"
                    src={metadata?.thumbnail?.url ?? metadata?.display?.url}
                    alt={metadata?.name}
                    withDefaults
                />
                <Text.Capture>{metadata?.description}</Text.Capture>
            </Page.Main>
        </Page>
    );
}

export default withSelectedCredential(NftDetails);
