import React from 'react';
import Page from '@popup/popupX/shared/Page';
import { WalletCredential } from '@shared/storage/types';
import { useParams } from 'react-router-dom';
import { useFlattenedAccountTokens } from '@popup/pages/Account/Tokens/utils';
import { withSelectedCredential } from '@popup/popupX/shared/utils/hoc';
import { useTranslation } from 'react-i18next';
import Button from '@popup/popupX/shared/Button';
import Copy from '@assets/svgX/copy.svg';
import { copyToClipboard } from '@popup/popupX/shared/utils/helpers';
import Card from '@popup/popupX/shared/Card';

type Params = {
    contractIndex: string;
    id: string;
};

function useSelectedToken(credential: WalletCredential) {
    const { contractIndex, id } = useParams<Params>();
    const token = useFlattenedAccountTokens(credential).find((t) => t.contractIndex === contractIndex && t.id === id);
    return token;
}

function NftRaw({ credential }: { credential: WalletCredential }) {
    const { t } = useTranslation('x', { keyPrefix: 'nft' });
    const token = useSelectedToken(credential);
    const metadata = token?.metadata || {};

    return (
        <Page className="nft-raw-x">
            <Page.Top heading={t('rawMetadata')}>
                <Button.Icon
                    icon={<Copy />}
                    onClick={() => copyToClipboard(JSON.stringify(token?.metadata, null, 2))}
                />
            </Page.Top>
            <Page.Main>
                <Card>
                    {Object.entries(metadata).map(([k, v]) => (
                        <Card.RowDetails key={k} title={k} value={JSON.stringify(v)} />
                    ))}
                </Card>
            </Page.Main>
        </Page>
    );
}

export default withSelectedCredential(NftRaw);
