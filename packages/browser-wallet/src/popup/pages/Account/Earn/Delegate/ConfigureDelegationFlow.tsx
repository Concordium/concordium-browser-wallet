import BackButton from '@popup/shared/BackButton';
import Button from '@popup/shared/Button';
import MultiStepForm from '@popup/shared/MultiStepForm';
import React from 'react';

type Form = {
    pool: string | null;
    settings: {
        amount: bigint;
        redelegate: boolean;
    };
};

type Props = {
    title: string;
    firstPageBack: boolean;
};

export default function ConfigureDelegationFlow({ title, firstPageBack }: Props) {
    const isFirstPage = false; // TODO figure this out...
    return (
        <div className="earn-page">
            <header className="earn-page__header">
                {(!isFirstPage || firstPageBack) && <BackButton className="earn-page__back" />}
                <h3 className="m-0">{title}</h3>
            </header>
            {/* eslint-disable-next-line no-console */}
            <MultiStepForm<Form> onDone={console.log}>
                {{
                    pool: {
                        render: (_, onNext) => (
                            <div>
                                Pool
                                <br />
                                <Button onClick={() => onNext(null)}>Next</Button>
                            </div>
                        ),
                    },
                    settings: {
                        render: (_, onNext) => (
                            <div>
                                Settings
                                <br />
                                <Button onClick={() => onNext({ amount: BigInt(1), redelegate: true })}>Next</Button>
                            </div>
                        ),
                    },
                }}
            </MultiStepForm>
        </div>
    );
}
