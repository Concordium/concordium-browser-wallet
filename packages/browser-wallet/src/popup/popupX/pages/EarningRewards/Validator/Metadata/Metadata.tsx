import React, { useCallback } from 'react';
import Page from '@popup/popupX/shared/Page';
import { useTranslation } from 'react-i18next';
import Text from '@popup/popupX/shared/Text';
import Form, { useForm } from '@popup/popupX/shared/Form';
import FormInput from '@popup/popupX/shared/Form/Input/Input';
import { METADATAURL_MAX_LENGTH } from '@shared/constants/baking';
import Button from '@popup/popupX/shared/Button';

type MetadataForm = { value: string };

type Props = {
    initial?: string;
    onSubmit(value: string): void;
};

export default function Metadata({ initial, onSubmit }: Props) {
    const { t } = useTranslation('x', { keyPrefix: 'earn.validator.metadata' });
    const form = useForm<MetadataForm>({ defaultValues: { value: initial ?? '' } });

    const submit = useCallback(
        (v: MetadataForm) => {
            onSubmit(v.value);
        },
        [onSubmit]
    );

    return (
        <Page className="validator-metadata">
            <Page.Top heading={t('title')} />
            <Text.Capture>{t('description')}</Text.Capture>
            <Form<MetadataForm> formMethods={form} onSubmit={submit}>
                {(f) => (
                    <FormInput
                        register={f.register}
                        name="value"
                        label={t('field.label')}
                        rules={{
                            maxLength: {
                                value: METADATAURL_MAX_LENGTH,
                                message: t('field.error.maxLength', { max: METADATAURL_MAX_LENGTH }),
                            },
                        }}
                    />
                )}
            </Form>
            <Page.Footer>
                <Button.Main label={t('buttonContinue')} onClick={form.handleSubmit(submit)} />
            </Page.Footer>
        </Page>
    );
}
