import React, { useContext, useEffect } from 'react';

import ExternalRequestLayout from '@popup/page-layouts/ExternalRequestLayout';
import { fullscreenPromptContext } from '@popup/page-layouts/FullscreenPromptLayout';
import Button from '@popup/shared/Button';

type Props = {
    onSubmit(proof: unknown): void;
    onReject(): void;
};

export default function IdProofRequest({ onReject, onSubmit }: Props) {
    const { onClose, withClose } = useContext(fullscreenPromptContext);

    useEffect(() => onClose(onReject), [onClose, onReject]);

    return (
        <ExternalRequestLayout>
            THiS IS A PROOF
            <br />
            <Button onClick={withClose(onSubmit)}>Submit</Button>
        </ExternalRequestLayout>
    );
}
