import React, { useContext, useEffect } from 'react';

import ExternalRequestLayout from '@popup/page-layouts/ExternalRequestLayout';
import { fullscreenPromptContext } from '@popup/page-layouts/FullscreenPromptLayout';
import Button from '@popup/shared/Button';
import { IdStatement, RevealStatement, StatementTypes } from '@popup/shared/idProofTypes';
import { useAtomValue } from 'jotai';
import { selectedAccountAtom } from '@popup/store/account';
import { DisplayRevealStatement, DisplaySecretStatement } from './DisplayStatement';
import { SecretStatement } from './DisplayStatement/utils';

const mock: IdStatement = [
    {
        type: StatementTypes.AttributeInRange,
        attributeTag: 'dob',
        lower: new Date().toISOString(),
        upper: new Date().toISOString(),
    },
    {
        type: StatementTypes.RevealAttribute,
        attributeTag: 'firstName',
    },
    {
        type: StatementTypes.RevealAttribute,
        attributeTag: 'lastName',
    },
];

type Props = {
    onSubmit(proof: unknown): void;
    onReject(): void;
};

export default function IdProofRequest({ onReject, onSubmit }: Props) {
    const { onClose, withClose } = useContext(fullscreenPromptContext);

    const account = useAtomValue(selectedAccountAtom); // TODO: change to account included in request.

    const reveals = mock.filter((s) => s.type === StatementTypes.RevealAttribute) as RevealStatement[];
    const secrets = mock.filter((s) => s.type !== StatementTypes.RevealAttribute) as SecretStatement[];
    const dappName = 'Example dapp';

    useEffect(() => onClose(onReject), [onClose, onReject]);

    if (!account) {
        return null;
    }

    return (
        <ExternalRequestLayout>
            {reveals.length !== 0 && (
                <DisplayRevealStatement
                    className="m-t-10:not-first"
                    dappName={dappName}
                    account={account}
                    statements={reveals}
                />
            )}
            {secrets.map((s, i) => (
                <DisplaySecretStatement
                    // eslint-disable-next-line react/no-array-index-key
                    key={i}
                    className="m-t-10:not-first"
                    dappName={dappName}
                    account={account}
                    statement={s}
                />
            ))}
            <br />
            <Button onClick={withClose(onSubmit)}>Submit</Button>
        </ExternalRequestLayout>
    );
}
