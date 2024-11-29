import React from 'react';
import File from '@assets/svgX/file.svg';
import FolderOpen from '@assets/svgX/folder-open.svg';
import Page from '@popup/popupX/shared/Page';
import Button from '@popup/popupX/shared/Button';
import { useTranslation } from 'react-i18next';
import Text from '@popup/popupX/shared/Text';
import Card from '@popup/popupX/shared/Card';

export default function Web3IdImport() {
    const { t } = useTranslation('x', { keyPrefix: 'web3Id.import' });

    return (
        <Page className="web3-id-x import">
            <Page.Top heading={t('importWeb3Id')} />
            <Page.Main>
                <Card>
                    <File />
                    <Text.Capture>{t('dragAndDropFile')}</Text.Capture>
                </Card>
                <Button.IconText icon={<FolderOpen />} label={t('selectFile')} />
            </Page.Main>
        </Page>
    );
}
