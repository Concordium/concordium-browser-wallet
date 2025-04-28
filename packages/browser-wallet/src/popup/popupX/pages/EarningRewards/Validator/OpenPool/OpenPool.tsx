import React, { useCallback, useState } from 'react';
import { ToggleCheckbox } from '@popup/popupX/shared/Form/ToggleCheckbox';
import Button from '@popup/popupX/shared/Button';
import Card from '@popup/popupX/shared/Card';
import Page from '@popup/popupX/shared/Page';
import { OpenStatusText } from '@concordium/web-sdk';
import { useTranslation } from 'react-i18next';
import Text from '@popup/popupX/shared/Text';

type Props = {
    initial?: OpenStatusText;
    onSubmit(value: OpenStatusText): void;
};

function toBoolean(status: OpenStatusText): boolean {
    switch (status) {
        case OpenStatusText.OpenForAll:
            return true;
        case OpenStatusText.ClosedForAll:
            return false;
        default:
            throw new Error('Not supported');
    }
}

function toStatus(value: boolean): OpenStatusText {
    return value ? OpenStatusText.OpenForAll : OpenStatusText.ClosedForAll;
}

export default function OpenPool({ initial = OpenStatusText.OpenForAll, onSubmit }: Props) {
    const { t } = useTranslation('x', { keyPrefix: 'earn.validator.openStatus' });
    const [value, setValue] = useState(toBoolean(initial));
    const submit = useCallback(() => {
        onSubmit(toStatus(value));
    }, [onSubmit, value]);

    return (
        <Page className="open-pool-container">
            <Page.Top heading={t('title')} />
            <Card className="open-pool__card">
                <div className="open-pool__card_delegation">
                    <Text.Main>{t('switch.label')}</Text.Main>
                    <ToggleCheckbox checked={value} onChange={(e) => setValue(e.currentTarget.checked)} />
                </div>
                <Text.Capture>{t('description')}</Text.Capture>
            </Card>
            <Page.Footer>
                <Button.Main className="m-t-20" label={t('buttonContinue')} onClick={submit} />
            </Page.Footer>
        </Page>
    );
}
