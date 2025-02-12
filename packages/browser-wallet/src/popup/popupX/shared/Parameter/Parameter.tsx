import React from 'react';
import Text from '@popup/popupX/shared/Text';
import { useTranslation } from 'react-i18next';
import { TextArea } from '@popup/popupX/shared/Form/TextArea';

type ParameterProps = { value: string };

export default function Parameter({ value }: ParameterProps) {
    const { t } = useTranslation('x', { keyPrefix: 'sharedX.parameter' });
    return (
        <div className="parameter-x">
            <Text.MainRegular>{t('parameter')}</Text.MainRegular>
            <TextArea readOnly value={value} />
        </div>
    );
}
