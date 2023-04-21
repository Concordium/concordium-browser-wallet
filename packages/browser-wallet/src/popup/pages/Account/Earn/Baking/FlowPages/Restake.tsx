import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import Form from '@popup/shared/Form';
import { MultiStepFormPageProps } from '@popup/shared/MultiStepForm';
import Submit from '@popup/shared/Form/Submit';
import { FormRadios } from '@popup/shared/Form/Radios/Radios';
import { ConfigureBakerFlowState } from '../utils';

type RestakePageForm = {
    restake: boolean;
};

type RestakePageProps = MultiStepFormPageProps<ConfigureBakerFlowState['restake'], ConfigureBakerFlowState>;

export default function RestakePage({ initial, onNext }: RestakePageProps) {
    const { t } = useTranslation('account', { keyPrefix: 'baking.configure' });
    const defaultValues: Partial<RestakePageForm> = useMemo(
        () => (initial === undefined ? { restake: true } : { restake: initial }),
        [initial]
    );
    const onSubmit = (vs: RestakePageForm) => onNext(vs.restake);

    return (
        <Form<RestakePageForm> className="configure-flow-form" defaultValues={defaultValues} onSubmit={onSubmit}>
            {(f) => (
                <>
                    <div>
                        <div className="m-t-0">{t('restake.description')}</div>
                        <FormRadios
                            className="m-t-20 w-full"
                            control={f.control}
                            name="restake"
                            options={[
                                { value: true, label: t('restake.optionRestake') },
                                { value: false, label: t('restake.optionNoRestake') },
                            ]}
                        />
                    </div>
                    <Submit className="m-t-20" width="wide">
                        {t('continueButton')}
                    </Submit>
                </>
            )}
        </Form>
    );
}
