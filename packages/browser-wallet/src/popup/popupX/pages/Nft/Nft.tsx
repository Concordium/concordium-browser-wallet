import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAtomValue } from 'jotai';
import Page from '@popup/popupX/shared/Page';
import Text from '@popup/popupX/shared/Text';
import Button from '@popup/popupX/shared/Button';
import { displayNameAndSplitAddress, useSelectedCredential } from '@popup/shared/utils/account-helpers';
import Img from '@popup/shared/Img';
import { WalletCredential } from '@shared/storage/types';
import { AccountTokenDetails, useFlattenedAccountTokens } from '@popup/pages/Account/Tokens/utils';
import { getMetadataUnique } from '@shared/utils/token-helpers';
import { useNavigate } from 'react-router-dom';
import { relativeRoutes } from '@popup/popupX/constants/routes';
import { contractBalancesFamily } from '@popup/store/token';

function useFilteredTokens(account: WalletCredential | undefined, unique: boolean) {
    const tokens = useFlattenedAccountTokens(account);
    return tokens.filter((t) => getMetadataUnique(t.metadata) === unique);
}

function TokenDisplay({
    accountAddress,
    token,
    owned,
}: {
    accountAddress: string;
    token: AccountTokenDetails;
    owned?: boolean;
}) {
    const { contractIndex, id, metadata } = token;
    const nav = useNavigate();
    const navToDetails = () =>
        nav(relativeRoutes.settings.nft.details.path.replace(':contractIndex', contractIndex).replace(':id', id));
    const { [id]: balance } = useAtomValue(contractBalancesFamily(accountAddress, contractIndex));

    // Hide not owned tokens
    if (owned && balance === 0n) return null;

    // Hide owned tokens
    if (!owned && balance !== 0n) return null;

    return (
        <Button.Base key={`${contractIndex}.${id}`} onClick={() => navToDetails()} className="nft-x__list_item">
            <Img
                className="nft-x__list_item-img"
                src={metadata.thumbnail?.url ?? metadata.display?.url}
                alt={metadata.name}
                withDefaults
            />
            <Text.MainRegular>{metadata.name}</Text.MainRegular>
        </Button.Base>
    );
}

function NftList({
    account,
    tokens,
    owned,
}: {
    account: WalletCredential;
    tokens: AccountTokenDetails[];
    owned?: boolean;
}) {
    return (
        <div className="nft-x__list">
            {tokens.map((token) => (
                <TokenDisplay
                    accountAddress={account.address}
                    key={`${token.contractIndex}.${token.id}`}
                    token={token}
                    owned={owned}
                />
            ))}
        </div>
    );
}

export default function Nft() {
    const { t } = useTranslation('x', { keyPrefix: 'nft' });
    const account = useSelectedCredential();
    const tokens = useFilteredTokens(account, true);

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
                <NftList account={account} tokens={tokens} owned />
                <span className="owner">
                    <Text.Label>{t('unownedUnique')}</Text.Label>
                </span>
                <NftList account={account} tokens={tokens} />
            </Page.Main>
        </Page>
    );
}
