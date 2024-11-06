import React from 'react';
import { useTranslation } from 'react-i18next';
import Page from '@popup/popupX/shared/Page';
import Text from '@popup/popupX/shared/Text';
import Button from '@popup/popupX/shared/Button';
import { displayNameAndSplitAddress, useSelectedCredential } from '@popup/shared/utils/account-helpers';
import Img from '@popup/shared/Img';
import { WalletCredential } from '@shared/storage/types';
import { useFlattenedAccountTokens } from '@popup/pages/Account/Tokens/utils';
import { getMetadataUnique } from '@shared/utils/token-helpers';
import { useNavigate } from 'react-router-dom';
import { relativeRoutes } from '@popup/popupX/constants/routes';

function useFilteredTokens(account: WalletCredential, unique: boolean) {
    const tokens = useFlattenedAccountTokens(account);
    return tokens.filter((t) => getMetadataUnique(t.metadata) === unique);
}

function NftList({ account }: { account: WalletCredential }) {
    const tokens = useFilteredTokens(account, true);
    const nav = useNavigate();
    const navToDetails = (contractIndex: string, id: string) =>
        nav(relativeRoutes.settings.nft.details.path.replace(':contractIndex', contractIndex).replace(':id', id));

    return (
        <div className="nft-x__list">
            {tokens.map(({ contractIndex, id, metadata }) => (
                <Button.Base
                    key={`${contractIndex}.${id}`}
                    onClick={() => navToDetails(contractIndex, id)}
                    className="nft-x__list_item"
                >
                    <Img
                        className="nft-x__list_item-img"
                        src={metadata.thumbnail?.url ?? metadata.display?.url}
                        alt={metadata.name}
                        withDefaults
                    />
                    <Text.MainRegular>{metadata.name}</Text.MainRegular>
                </Button.Base>
            ))}
        </div>
    );
}

export default function Nft() {
    const { t } = useTranslation('x', { keyPrefix: 'nft' });
    const account = useSelectedCredential();

    if (account === undefined) {
        return null;
    }

    return (
        <Page className="nft-x">
            <Page.Top heading={t('nft')} />
            <Page.Main>
                <span className="owner">
                    <Text.Label>{t('owned')}</Text.Label>
                    <Text.Capture>{t('on', { value: displayNameAndSplitAddress(account) })}</Text.Capture>
                </span>
                <NftList account={account} />
            </Page.Main>
        </Page>
    );
}
