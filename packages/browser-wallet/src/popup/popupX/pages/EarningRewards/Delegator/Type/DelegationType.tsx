import React from 'react';
import { FormRadio } from '@popup/popupX/shared/Form/Radios';
import { Trans, useTranslation } from 'react-i18next';
import Page from '@popup/popupX/shared/Page';
import ExternalLink from '@popup/popupX/shared/ExternalLink';
import { DelegationTargetType } from '@concordium/web-sdk';
import Form, { useForm } from '@popup/popupX/shared/Form';
import Button from '@popup/popupX/shared/Button';

/** Describes the form values for configuring the delegation target of a delegation transaction */
export type DelegationTypeForm = {
    /** The target for the delegation */
    target: DelegationTargetType;
    /** The target baker ID - only relevant for target = {@linkcode DelegationTargetType.Baker} */
    bakerId?: string;
};

type Props = {
    /** The initial values delegation configuration target step */
    initialValues: DelegationTypeForm | undefined;
    /** The submit handler triggered when submitting the form in the step */
    onSubmit(values: DelegationTypeForm): void;
};

export default function DelegationType({ initialValues, onSubmit }: Props) {
    const form = useForm<DelegationTypeForm>({
        defaultValues: initialValues ?? { target: DelegationTargetType.PassiveDelegation },
    });
    const { t } = useTranslation('x', { keyPrefix: 'earn.delegator.target' });
    const submit = form.handleSubmit(onSubmit);
    return (
        <Page className="delegation-type-container">
            <Page.Top heading={t('title')} />
            <span className="capture__main_small">{t('description')}</span>
            <Form<DelegationTypeForm> className="delegation-type__select-form" formMethods={form}>
                {(f) => (
                    <>
                        <FormRadio
                            id={DelegationTargetType.Baker}
                            label={t('radioValidatorLabel')}
                            name="target"
                            register={f.register}
                        />
                        <FormRadio
                            id={DelegationTargetType.PassiveDelegation}
                            label={t('radioPassiveLabel')}
                            name="target"
                            register={f.register}
                        />
                    </>
                )}
            </Form>
            <span className="capture__main_small">
                <Trans
                    t={t}
                    i18nKey="passiveDelegationDescription"
                    components={{
                        '1': (
                            <ExternalLink path="https://developer.concordium.software/en/mainnet/net/concepts/concepts-delegation.html" />
                        ),
                    }}
                />
            </span>
            <Button.Main label={t('buttonContinue')} onClick={submit} />
        </Page>
    );
}
