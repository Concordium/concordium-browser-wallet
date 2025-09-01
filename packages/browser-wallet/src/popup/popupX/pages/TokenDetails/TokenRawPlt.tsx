import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAtomValue } from 'jotai';
import { useTranslation } from 'react-i18next';
import { TokenId, TokenInfo } from '@concordium/web-sdk/plt';
import { grpcClientAtom } from '@popup/store/settings';
import Page from '@popup/popupX/shared/Page';
import Button from '@popup/popupX/shared/Button';
import Copy from '@assets/svgX/copy.svg';
import Card from '@popup/popupX/shared/Card';
import { useCopyToClipboard } from '@popup/popupX/shared/utils/hooks';
import { cborDecode } from '@popup/popupX/shared/utils/helpers';

type Params = {
    pltSymbol: string;
};

function useSelectedToken() {
    const { pltSymbol = '' } = useParams<Params>();
    const client = useAtomValue(grpcClientAtom);
    const [pltInfo, setPltInfo] = useState<TokenInfo>();
    useEffect(() => {
        client.getTokenInfo(TokenId.fromString(pltSymbol)).then((tokenDetails) => {
            setPltInfo(tokenDetails);
        });
    }, []);

    return pltInfo;
}

function TokenRawPlt() {
    const { t } = useTranslation('x', { keyPrefix: 'tokenDetails' });
    const token = useSelectedToken();
    const copyToClipboard = useCopyToClipboard();
    const moduleState = cborDecode(token?.state.moduleState.toString());

    return (
        <Page className="token-raw-x">
            <Page.Top heading={t('rawMetadata')}>
                <Button.Icon icon={<Copy />} onClick={() => copyToClipboard(JSON.stringify(moduleState, null, 2))} />
            </Page.Top>
            <Page.Main>
                <Card>
                    {Object.entries(moduleState).map(([k, v]) => (
                        <Card.RowDetails key={k} title={k} value={JSON.stringify(v, null, 2)} />
                    ))}
                </Card>
            </Page.Main>
        </Page>
    );
}

export default TokenRawPlt;
