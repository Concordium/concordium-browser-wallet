import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Page from '@popup/popupX/shared/Page';
import Card from '@popup/popupX/shared/Card';
import Img from '@popup/shared/Img';
import Text from '@popup/popupX/shared/Text';
import Button from '@popup/popupX/shared/Button';
import FullscreenNotice from '@popup/popupX/shared/FullscreenNotice';
import { useCopyToClipboard } from '@popup/popupX/shared/utils/hooks';
import Copy from '@assets/svgX/copy.svg';
import Notebook from '@assets/svgX/notebook.svg';
import { ContractAddress } from '@concordium/web-sdk';
import { ChoiceStatus, ContractTokenDetails } from '@shared/utils/token-helpers';

const SUB_INDEX = 0;

type LoadedTokens = ContractTokenDetails & { status: ChoiceStatus };

type TokenDetailProps = {
    token: LoadedTokens;
    contractAddress: ContractAddress.Serializable;
    detailsIsOpen: boolean;
    setDetailsIsOpen(value: React.SetStateAction<boolean>): void;
};

export default function SearchTokenDetails({
    token,
    contractAddress,
    detailsIsOpen,
    setDetailsIsOpen,
}: TokenDetailProps) {
    const { t } = useTranslation('x', { keyPrefix: 'tokenDetails' });
    const [rawDataIsOpen, setRawDataIsOpen] = useState(false);
    const copyToClipboard = useCopyToClipboard();
    const { index, subindex } = contractAddress;
    const { metadata = {}, id } = token || { metadata: {} };
    const { thumbnail, display, symbol, name, description, decimals } = metadata;

    return (
        <>
            <FullscreenNotice open={rawDataIsOpen} onClose={() => setRawDataIsOpen(false)}>
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
            <FullscreenNotice open={detailsIsOpen} onClose={() => setDetailsIsOpen(false)}>
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
                            {!!Number(index) && (
                                <Card.RowDetails
                                    title={t('indexSubindex')}
                                    value={`${index}, ${subindex || SUB_INDEX}`}
                                />
                            )}
                        </Card>
                        <Button.IconText
                            icon={<Notebook />}
                            label={t('showRawMetadata')}
                            onClick={() => {
                                setRawDataIsOpen(true);
                            }}
                        />
                    </Page.Main>
                </Page>
            </FullscreenNotice>
        </>
    );
}
