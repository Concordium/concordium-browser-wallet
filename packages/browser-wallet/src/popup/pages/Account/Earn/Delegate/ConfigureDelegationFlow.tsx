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
};

export default function ConfigureDelegationFlow({ title }: Props) {
    return (
        <>
            <div>{title}</div>
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
        </>
    );
}
