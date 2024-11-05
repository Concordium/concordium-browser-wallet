import React, { useCallback, useMemo, useState } from 'react';
import { BakerKeysWithProofs, generateBakerKeys } from '@concordium/web-sdk';

import ExportIcon from '@assets/svgX/sign-out.svg';
import Caret from '@assets/svgX/caret-right.svg';
import Page from '@popup/popupX/shared/Page';
import Text from '@popup/popupX/shared/Text';
import Button from '@popup/popupX/shared/Button';
import Card from '@popup/popupX/shared/Card';
import { ensureDefined } from '@shared/utils/basic-helpers';
import { saveData } from '@popup/shared/utils/file-helpers';
import { useSelectedAccountInfo } from '@popup/shared/AccountInfoListenerContext/AccountInfoListenerContext';
import { getBakerKeyExport } from '@popup/shared/utils/baking-helpers';
import clsx from 'clsx';

const KEYS_FILENAME = 'validator-credentials.json';

type Props = { onSubmit(keys: BakerKeysWithProofs): void };

export default function ValidatorKeys({ onSubmit }: Props) {
    const [expand, setExpand] = useState(false);
    const [exported, setExported] = useState(false);
    const accountInfo = ensureDefined(useSelectedAccountInfo(), 'Expected seleted account');
    const keysFull = useMemo(() => generateBakerKeys(accountInfo.accountAddress), [accountInfo]);
    const keysPublic: BakerKeysWithProofs = useMemo(
        () => ({
            proofSig: keysFull.proofSig,
            proofElection: keysFull.proofElection,
            proofAggregation: keysFull.proofAggregation,
            electionVerifyKey: keysFull.electionVerifyKey,
            signatureVerifyKey: keysFull.signatureVerifyKey,
            aggregationVerifyKey: keysFull.aggregationVerifyKey,
        }),
        [keysFull]
    );

    const exportKeys = useCallback(() => {
        saveData(getBakerKeyExport(keysFull, accountInfo), KEYS_FILENAME);
        setExported(true);
    }, [keysFull]);

    return (
        <Page className={clsx('validator-keys', expand && 'validator-keys--expanded')}>
            <Page.Top heading="Validator keys" />
            <Text.Capture>
                Your new validator keys have been generated. Before you can continue, you must export and save them. The
                keys will have to be added to the validator node.
            </Text.Capture>
            <Card>
                <Card.Row>
                    <Card.RowDetails title="Election verify key" value={keysPublic.electionVerifyKey} />
                </Card.Row>
                <Card.Row>
                    <Card.RowDetails title="Signature verify key" value={keysPublic.signatureVerifyKey} />
                </Card.Row>
                <Card.Row>
                    <Card.RowDetails title="Aggregation verify key" value={keysPublic.aggregationVerifyKey} />
                </Card.Row>
            </Card>
            <div>
                <Button.IconText
                    className="validator-keys__expand"
                    icon={<Caret />}
                    label={expand ? 'Show less' : 'Show full'}
                    onClick={() => setExpand((v) => !v)}
                />
                <Button.IconText icon={<ExportIcon />} label="Export keys as .json" onClick={exportKeys} />
            </div>
            {exported && (
                <Page.Footer>
                    <Button.Main label="Continue" onClick={() => onSubmit(keysPublic)} />
                </Page.Footer>
            )}
        </Page>
    );
}
