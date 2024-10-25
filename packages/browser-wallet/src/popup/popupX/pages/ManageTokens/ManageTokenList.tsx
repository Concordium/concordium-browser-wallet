import React from 'react';
import Page from '@popup/popupX/shared/Page';
import Plus from '@assets/svgX/plus.svg';
import Button from '@popup/popupX/shared/Button';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { relativeRoutes } from '@popup/popupX/constants/routes';
import { WalletCredential } from '@shared/storage/types';
import { useFlattenedAccountTokens } from '@popup/pages/Account/Tokens/utils';
import { getMetadataUnique } from '@shared/utils/token-helpers';
import { withSelectedCredential } from '@popup/popupX/shared/utils/hoc';
import TokenList from '@popup/popupX/shared/TokenList';

/** Hook loading every fungible token added to the account. */
function useAccountFungibleTokens(account: WalletCredential) {
    const tokens = useFlattenedAccountTokens(account);
    return tokens.filter((t) => !getMetadataUnique(t.metadata));
}

function ManageTokenList({ credential }: { credential: WalletCredential }) {
    const { t } = useTranslation('x', { keyPrefix: 'mangeTokens' });
    const nav = useNavigate();
    const navToAddToken = () => nav(relativeRoutes.home.manageTokenList.addToken.path);
    const tokens = useAccountFungibleTokens(credential);

    return (
        <Page className="manage-token-list-x">
            <Page.Top heading={t('manageTokenList')}>
                <Button.Icon icon={<Plus />} onClick={navToAddToken} />
            </Page.Top>
            <Page.Main>
                <TokenList>
                    {tokens.map((token) => (
                        <TokenList.Item thumbnail={token.metadata.thumbnail?.url} symbol={token.metadata.symbol} />
                    ))}
                </TokenList>
            </Page.Main>
        </Page>
    );
}

export default withSelectedCredential(ManageTokenList);
