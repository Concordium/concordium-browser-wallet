import React, { useCallback, useMemo, useState } from 'react';
import { GenerateBakerKeysOutput, generateBakerKeys } from '@concordium/web-sdk';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

import ExportIcon from '@assets/svgX/sign-out.svg';
import Caret from '@assets/svgX/caret-right.svg';
import Page from '@popup/popupX/shared/Page';
import Text from '@popup/popupX/shared/Text';
import Button from '@popup/popupX/shared/Button';
import Card from '@popup/popupX/shared/Card';
import { ensureDefined } from '@shared/utils/basic-helpers';
import { saveData } from '@popup/shared/utils/file-helpers';
import { useSelectedAccountInfo } from '@popup/shared/AccountInfoListenerContext/AccountInfoListenerContext';
import { getBakerKeyExport } from '@popup/shared/utils/baking-helpers';

const KEYS_FILENAME = 'validator-credentials.json';

type Props = {
    initial: GenerateBakerKeysOutput | undefined;
    onSubmit(keys: GenerateBakerKeysOutput): void;
};

export default function ValidatorKeys({ onSubmit, initial }: Props) {
    const { t } = useTranslation('x', { keyPrefix: 'earn.validator' });
    const [expand, setExpand] = useState(false);
    const [exported, setExported] = useState(false);
    const accountInfo = ensureDefined(useSelectedAccountInfo(), 'Expected seleted account');
    const keys = useMemo(() => initial ?? generateBakerKeys(accountInfo.accountAddress), [initial, accountInfo]);

    const exportKeys = useCallback(() => {
        saveData(getBakerKeyExport(keys, accountInfo), KEYS_FILENAME);
        setExported(true);
    }, [keys]);

    return (
        <Page className={clsx('validator-keys', expand && 'validator-keys--expanded')}>
            <Page.Top heading={t('keys.title')} />
            <Text.Capture>{t('keys.description')}</Text.Capture>
            <Card>
                <Card.Row>
                    <Card.RowDetails title={t('values.electionKey.label')} value={keys.electionVerifyKey} />
                </Card.Row>
                <Card.Row>
                    <Card.RowDetails title={t('values.signatureKey.label')} value={keys.signatureVerifyKey} />
                </Card.Row>
                <Card.Row>
                    <Card.RowDetails title={t('values.aggregationKey.label')} value={keys.aggregationVerifyKey} />
                </Card.Row>
            </Card>
            <div>
                <Button.IconText
                    className="validator-keys__expand"
                    icon={<Caret />}
                    label={expand ? t('keys.buttonToggle.less') : t('keys.buttonToggle.full')}
                    onClick={() => setExpand((v) => !v)}
                />
                <Button.IconText icon={<ExportIcon />} label={t('keys.buttonExport')} onClick={exportKeys} />
            </div>
            {(exported || initial !== undefined) && (
                <Page.Footer>
                    <Button.Main label={t('keys.buttonContinue')} onClick={() => onSubmit(keys)} />
                </Page.Footer>
            )}
        </Page>
    );
}
