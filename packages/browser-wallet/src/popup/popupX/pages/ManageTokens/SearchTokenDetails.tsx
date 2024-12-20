import React from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Page from '@popup/popupX/shared/Page';
import Card from '@popup/popupX/shared/Card';
import Img from '@popup/shared/Img';
import Text from '@popup/popupX/shared/Text';
import Button from '@popup/popupX/shared/Button';
import { TokenWithPageID } from '@popup/pages/Account/Tokens/ManageTokens/utils';
import FullscreenNotice from '@popup/popupX/shared/FullscreenNotice';
import { useCopyToClipboard } from '@popup/popupX/shared/utils/hooks';
import Copy from '@assets/svgX/copy.svg';
import Notebook from '@assets/svgX/notebook.svg';

const SUB_INDEX = 0;

interface Location {
    state: {
        token: TokenWithPageID;
    };
}

export default function SearchTokenDetails() {
    const { t } = useTranslation('x', { keyPrefix: 'tokenDetails' });
    const [isOpen, setIsOpen] = React.useState(false);
    const copyToClipboard = useCopyToClipboard();
    const params = useParams();
    const location = useLocation() as Location;
    const { metadata = {}, id } = location.state.token || { metadata: {} };
    const { thumbnail, display, symbol, name, description, decimals } = metadata;

    return (
        <>
            <FullscreenNotice open={isOpen} onClose={() => setIsOpen(false)}>
                <Page>
                    <Page.Top heading={t('rawMetadata')}>
                        <Button.Icon
                            icon={<Copy />}
                            onClick={() => copyToClipboard(JSON.stringify(metadata, null, 2))}
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
            </FullscreenNotice>
            <Page className="token-details-x">
                <Page.Main>
                    <Card>
                        <div className="token-details-x__token">
                            <Img
                                className="token-icon"
                                src={thumbnail?.url || display?.url || ''}
                                alt={symbol}
                                withDefaults
                            />
                            <Text.Main>{name}</Text.Main>
                        </div>
                        <Card.RowDetails title={t('description')} value={description} />
                        {decimals && <Card.RowDetails title={t('decimals')} value={`0 - ${decimals}`} />}
                        {id && <Card.RowDetails title={t('tokenId')} value={id} />}
                        <Card.RowDetails title={t('indexSubindex')} value={`${params.contractIndex}, ${SUB_INDEX}`} />
                    </Card>
                    <Button.IconText
                        icon={<Notebook />}
                        label={t('showRawMetadata')}
                        onClick={() => {
                            setIsOpen(true);
                        }}
                    />
                </Page.Main>
            </Page>
        </>
    );
}
