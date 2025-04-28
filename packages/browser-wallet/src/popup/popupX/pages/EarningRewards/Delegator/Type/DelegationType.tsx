import React from 'react';
import { FormRadio } from '@popup/popupX/shared/Form/Radios';
import { Trans, useTranslation } from 'react-i18next';
import { Validate } from 'react-hook-form';
import { useAtomValue } from 'jotai';
import { DelegationTargetType, OpenStatusText } from '@concordium/web-sdk';

import Page from '@popup/popupX/shared/Page';
import ExternalLink from '@popup/popupX/shared/ExternalLink';
import Form, { useForm } from '@popup/popupX/shared/Form';
import Button from '@popup/popupX/shared/Button';
import FormInput from '@popup/popupX/shared/Form/Input/Input';
import Text from '@popup/popupX/shared/Text';
import { grpcClientAtom, networkConfigurationAtom } from '@popup/store/settings';
import { DelegationTypeForm } from '../util';

type Props = {
    title: string;
    /** The initial values delegation configuration target step */
    initialValues?: DelegationTypeForm;
    /** The submit handler triggered when submitting the form in the step */
    onSubmit(values: DelegationTypeForm): void;
};

export default function DelegationType({ initialValues, onSubmit, title }: Props) {
    const network = useAtomValue(networkConfigurationAtom);
    const client = useAtomValue(grpcClientAtom);
    const { t } = useTranslation('x', { keyPrefix: 'earn.delegator.target' });

    const form = useForm<DelegationTypeForm>({
        defaultValues: initialValues ?? { type: DelegationTargetType.PassiveDelegation },
    });
    const submit = form.handleSubmit(onSubmit);
    const target = form.watch('type');

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
            <Page.Top heading={title} />
            <Text.Capture>{t('description')}</Text.Capture>
            <Form<DelegationTypeForm> className="delegation-type__select-form" formMethods={form} onSubmit={onSubmit}>
                {(f) => (
                    <>
                        <FormRadio
                            id={DelegationTargetType.Baker}
                            label={t('radioValidatorLabel')}
                            name="type"
                            register={f.register}
                        />
                        <FormRadio
                            id={DelegationTargetType.PassiveDelegation}
                            label={t('radioPassiveLabel')}
                            name="type"
                            register={f.register}
                        />
                        {target === DelegationTargetType.Baker && (
                            <FormInput
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
            <Text.Capture>
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
            </Text.Capture>
            <Page.Footer>
                <Button.Main label={t('buttonContinue')} onClick={submit} />
            </Page.Footer>
        </Page>
    );
}
