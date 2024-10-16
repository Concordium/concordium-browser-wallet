import React from 'react';
import { FormRadio } from '@popup/popupX/shared/Form/Radios';
import { Trans, useTranslation } from 'react-i18next';
import { Validate } from 'react-hook-form';
import Page from '@popup/popupX/shared/Page';
import ExternalLink from '@popup/popupX/shared/ExternalLink';
import { DelegationTargetType, OpenStatusText } from '@concordium/web-sdk';
import Form, { useForm } from '@popup/popupX/shared/Form';
import Button from '@popup/popupX/shared/Button';
import FormInput from '@popup/popupX/shared/Form/Input/Input';
import { useAtomValue } from 'jotai';
import { grpcClientAtom, networkConfigurationAtom } from '@popup/store/settings';

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
    const network = useAtomValue(networkConfigurationAtom);
    const client = useAtomValue(grpcClientAtom);
    const { t } = useTranslation('x', { keyPrefix: 'earn.delegator.target' });

    const form = useForm<DelegationTypeForm>({
        defaultValues: initialValues ?? { target: DelegationTargetType.PassiveDelegation },
    });
    const submit = form.handleSubmit(onSubmit);
    const target = form.watch('target');

    const validateBakerId: Validate<string | undefined> = async (value) => {
        try {
            const bakerId = BigInt(value!); // Unwrap is safe here, as it will always be defined.
            const poolStatus = await client.getPoolInfo(bakerId);

            if (poolStatus.poolInfo?.openStatus !== OpenStatusText.OpenForAll) {
                return t('inputValidatorId.errorClosed');
            }
            return true;
        } catch {
            return t('inputValidatorId.errorNotValidator');
        }
    };

    return (
        <Page className="delegation-type-container">
            <Page.Top heading={t('title')} />
            <span className="capture__main_small">{t('description')}</span>
            <Form<DelegationTypeForm> className="delegation-type__select-form" formMethods={form} onSubmit={onSubmit}>
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
                        {target === DelegationTargetType.Baker && (
                            <FormInput // TODO: Add validation...
                                className="m-t-30 m-b-0"
                                name="bakerId"
                                register={f.register}
                                label={t('inputValidatorId.label')}
                                type="number"
                                rules={{
                                    required: t('inputValidatorId.errorRequired'),
                                    min: { value: 0, message: t('inputValidatorId.errorMin') },
                                    validate: validateBakerId,
                                }}
                            />
                        )}
                    </>
                )}
            </Form>
            <span className="capture__main_small">
                {target === DelegationTargetType.PassiveDelegation ? (
                    <Trans
                        t={t}
                        i18nKey="passiveDelegationDescription"
                        components={{
                            '1': (
                                <ExternalLink path="https://developer.concordium.software/en/mainnet/net/concepts/concepts-delegation.html" />
                            ),
                        }}
                    />
                ) : (
                    <Trans
                        t={t}
                        i18nKey="validatorDelegationDescription"
                        components={{
                            '1': <ExternalLink path={`${network.ccdScanUrl}nodes`} />,
                        }}
                    />
                )}
            </span>
            <Button.Main label={t('buttonContinue')} onClick={submit} />
        </Page>
    );
}
