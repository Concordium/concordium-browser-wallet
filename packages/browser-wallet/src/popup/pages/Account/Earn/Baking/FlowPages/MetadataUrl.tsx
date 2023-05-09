import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Form from '@popup/shared/Form';
import { MultiStepFormPageProps } from '@popup/shared/MultiStepForm';
import Submit from '@popup/shared/Form/Submit';
import Input from '@popup/shared/Form/Input';
import { METADATAURL_MAX_LENGTH } from '@shared/constants/baking';
import { ConfigureBakerFlowState } from '../utils';

type MetadataUrlForm = {
    url: string;
};

type MetadataUrlProps = MultiStepFormPageProps<ConfigureBakerFlowState['metadataUrl'], ConfigureBakerFlowState>;

export function MetadataUrlPage({ initial, onNext }: MetadataUrlProps) {
    const { t: tShared } = useTranslation('shared');
    const { t } = useTranslation('account', { keyPrefix: 'baking.configure' });
    const defaultValues: Partial<MetadataUrlForm> = useMemo(
        () => (initial ? { url: initial } : { url: '' }),
        [initial]
    );

    const onSubmit = (vs: MetadataUrlForm) => onNext(vs.url);

    return (
        <Form<MetadataUrlForm> className="configure-flow-form" defaultValues={defaultValues} onSubmit={onSubmit}>
            {(f) => (
                <>
                    <div>
                        <div className="m-t-0">{t('metadataUrl.description')}</div>
                        <Input
                            register={f.register}
                            className="m-t-20"
                            name="url"
                            label={t('metadataUrl.label')}
                            rules={{
                                maxLength: {
                                    value: METADATAURL_MAX_LENGTH,
                                    message: t('metadataUrl.maxLength', { maxLength: METADATAURL_MAX_LENGTH }),
                                },
                            }}
                        />
                    </div>
                    <Submit className="m-t-20" width="wide">
                        {tShared('continue')}
                    </Submit>
                </>
            )}
        </Form>
    );
}
