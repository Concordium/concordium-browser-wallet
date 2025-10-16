import React, { useEffect, useMemo, useState } from 'react';
import {
    AccountTransactionPayload,
    AccountTransactionType,
    CcdAmount,
    DeployModulePayload,
    InitContractPayload,
    RegisterDataPayload,
    sha256,
    SimpleTransferPayload,
    UpdateContractPayload,
    TokenUpdatePayload,
} from '@concordium/web-sdk';
import { Cbor, CborMemo, TokenOperationType } from '@concordium/web-sdk/plt';
import { SmartContractParameters } from '@concordium/browser-wallet-api-helpers';
import { useTranslation } from 'react-i18next';
import { chunkString, displayAsCcd } from 'wallet-common-helpers';
import * as JSONBig from 'json-bigint';
import { decode } from 'cbor2';
import Card from '@popup/popupX/shared/Card';
import Text from '@popup/popupX/shared/Text';
import SideArrow from '@assets/svgX/side-arrow.svg';
import Parameter from '@popup/popupX/shared/Parameter';
import { cborDecode } from '@popup/popupX/shared/utils/helpers';

export function DisplayParameters({ parameters }: { parameters?: SmartContractParameters }) {
    const hasParameters = parameters !== undefined && parameters !== null;
    if (!hasParameters) return null;
    return <Parameter value={JSONBig.stringify(parameters, null, 2)} />;
}

/**
 * Displays an overview of a simple transfer.
 */
function DisplaySimpleTransfer({ payload }: { payload: SimpleTransferPayload }) {
    const { t } = useTranslation('x', { keyPrefix: 'prompts.sendTransactionX.payload' });
    return (
        <>
            <Card.RowDetails title={t('amount')} value={displayAsCcd(payload.amount.microCcdAmount)} />
            <Card.RowDetails title={t('receiver')} value={payload.toAddress.address} />
        </>
    );
}

/**
 * Displays an overview of a update contract transaction.
 */
function DisplayUpdateContract({ payload }: { payload: Omit<UpdateContractPayload, 'message'> }) {
    const { t } = useTranslation('x', { keyPrefix: 'prompts.sendTransactionX.payload' });
    return (
        <>
            <Card.RowDetails
                title={t('contractIndex')}
                value={`${payload.address.index.toString()} (${payload.address.subindex.toString()})`}
            />
            <Card.RowDetails title={t('receiveName')} value={payload.receiveName.value} />
            <Card.RowDetails title={t('amount')} value={displayAsCcd(payload.amount.microCcdAmount)} />
            <Card.RowDetails
                title={t('maxEnergy')}
                value={`${payload.maxContractExecutionEnergy.value.toString()} ${t('nrg')}`}
            />
        </>
    );
}

/**
 * Displays an overview of a init contract transaction.
 */
function DisplayInitContract({ payload }: { payload: Omit<InitContractPayload, 'param'> }) {
    const { t } = useTranslation('x', { keyPrefix: 'prompts.sendTransactionX.payload' });

    return (
        <>
            <Card.RowDetails title={t('moduleReference')} value={payload.moduleRef.moduleRef} />
            <Card.RowDetails title={t('contractName')} value={payload.initName.value} />
            <Card.RowDetails title={t('amount')} value={displayAsCcd(payload.amount.microCcdAmount)} />
            <Card.RowDetails
                title={t('maxEnergy')}
                value={`${payload.maxContractExecutionEnergy.value.toString()} ${t('nrg')}`}
            />
        </>
    );
}

/**
 * Displays an overview of a register data.
 */
function DisplayRegisterData({ payload }: { payload: RegisterDataPayload }) {
    const { t } = useTranslation('x', { keyPrefix: 'prompts.sendTransactionX.payload' });
    const [decoded, setDecoded] = useState<string>();

    useEffect(() => {
        try {
            setDecoded(decode(payload.data.data));
        } catch {
            // display raw if unable to decode
        }
    }, []);

    const title = `${t('data')}${!decoded ? t('rawData') : ''}`;
    const value = decoded || payload.data.toJSON();

    return <Card.RowDetails title={title} value={value} />;
}

/**
 * Displays an overview of a deploy module transaction.
 */
function DisplayDeployModule({ payload }: { payload: DeployModulePayload }) {
    const { t } = useTranslation('x', { keyPrefix: 'prompts.sendTransactionX.payload' });
    const hash = useMemo(() => sha256([payload.source]).toString('hex'), []);
    const { version } = payload;

    return (
        <>
            {version && <Card.RowDetails title={t('version')} value={version.toString()} />}
            <Card.RowDetails title={t('moduleReference')} value={chunkString(hash, 32).join('\n')} />
        </>
    );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function displayValue(value: any) {
    if (CcdAmount.instanceOf(value)) {
        return displayAsCcd(value.microCcdAmount);
    }
    return value.toString();
}

function operationsCborDecoder(value: Cbor.Type) {
    const { t } = useTranslation('x', { keyPrefix: 'prompts.sendTransactionX.operations' });
    const getTitle = (key: TokenOperationType) => t(key) || key;

    if (Object.keys(cborDecode(value.toString())).length) {
        const decoded = Cbor.decode(value) as object[];

        const withDecodedMemo = decoded.map((item) =>
            Object.entries(item).reduce((acc, [key, operationValue]) => {
                const memo = operationValue.memo ? CborMemo.parse(operationValue.memo) : undefined;
                const memoString = typeof memo === 'object' ? JSON.stringify(memo, null, 2) : memo;
                return {
                    ...acc,
                    [key]: {
                        ...operationValue,
                        ...(!!memo && { memo: memoString }),
                    },
                };
            }, {})
        );

        const operationsList = withDecodedMemo.map((item: { [key: string]: object }) => {
            const operation = Object.keys(item)[0] as TokenOperationType;
            return (
                <Card key={operation}>
                    <Card.Row>
                        <Text.MainMedium>{getTitle(operation)}</Text.MainMedium>
                    </Card.Row>
                    {Object.entries(item[operation]).map(([key, operationValue]) => (
                        <Card.RowDetails title={key} value={displayValue(operationValue)} />
                    ))}
                </Card>
            );
        });

        return <div className="operations-list">{operationsList}</div>;
    }

    return value.toString();
}

export function ToggleAdvanced() {
    const { t } = useTranslation('x', { keyPrefix: 'prompts.sendTransactionX' });
    return (
        <label htmlFor="toggle-collapse" className="collapse-trigger">
            {t('advanced')}
            <SideArrow />
            <input type="checkbox" id="toggle-collapse" />
        </label>
    );
}

/**
 * Displays an overview of token update transaction payload.
 */
function DisplayTokenUpdate({ payload }: { payload: TokenUpdatePayload }) {
    const { t } = useTranslation('x', { keyPrefix: 'prompts.sendTransactionX.payload' });
    return (
        <>
            <Card.RowDetails title={t('tokenId')} value={payload.tokenId.toString()} />
            <Card.RowDetails title={<ToggleAdvanced />} value={operationsCborDecoder(payload.operations)} />
        </>
    );
}

/**
 * Displays an overview of any transaction payload.
 */
function DisplayGenericPayload({ payload }: { payload: AccountTransactionPayload }) {
    return (
        <>
            {Object.entries(payload).map(([key, value]) => (
                <Card.RowDetails title={key} value={displayValue(value)} />
            ))}
        </>
    );
}

export default function DisplayTransactionPayload({
    payload,
    type,
}: {
    type: AccountTransactionType;
    payload: AccountTransactionPayload;
}) {
    switch (type) {
        case AccountTransactionType.Transfer:
            return <DisplaySimpleTransfer payload={payload as SimpleTransferPayload} />;
        case AccountTransactionType.Update:
            return <DisplayUpdateContract payload={payload as UpdateContractPayload} />;
        case AccountTransactionType.InitContract:
            return <DisplayInitContract payload={payload as InitContractPayload} />;
        case AccountTransactionType.RegisterData:
            return <DisplayRegisterData payload={payload as RegisterDataPayload} />;
        case AccountTransactionType.DeployModule:
            return <DisplayDeployModule payload={payload as DeployModulePayload} />;
        case AccountTransactionType.TokenUpdate:
            return <DisplayTokenUpdate payload={payload as TokenUpdatePayload} />;
        default:
            return <DisplayGenericPayload payload={payload} />;
    }
}
