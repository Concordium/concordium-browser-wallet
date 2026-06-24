import React, { useEffect, useMemo, useState } from 'react';
import {
    AccountTransactionPayload,
    AccountTransactionType,
    CcdAmount,
    ConfigureDelegationPayload,
    DeployModulePayload,
    InitContractInput,
    LockController,
    LockCreateOperation,
    Memo,
    MetaUpdateOperation,
    MetaUpdateOperationType,
    MetaUpdatePayload,
    RegisterDataPayload,
    sha256,
    SimpleTransferPayload,
    TokenUpdatePayload,
    TransactionExpiry,
    UpdateContractInput,
} from '@concordium/web-sdk';
import {
    Cbor,
    CborMemo,
    decodeMetaUpdateOperations,
    TokenOperationType,
    UnknownMetaUpdateOperation,
} from '@concordium/web-sdk/plt';
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
function DisplayUpdateContract({ payload }: { payload: Omit<UpdateContractInput, 'message'> }) {
    const { t } = useTranslation('x', { keyPrefix: 'prompts.sendTransactionX.payload' });
    return (
        <>
            <Card.RowDetails
                title={t('contractIndex')}
                value={`${payload.address.index.toString()} (${payload.address.subindex.toString()})`}
            />
            <Card.RowDetails title={t('receiveName')} value={payload.receiveName.value} />
            <Card.RowDetails title={t('amount')} value={displayAsCcd(payload.amount.microCcdAmount)} />
            {payload.maxContractExecutionEnergy && (
                <Card.RowDetails
                    title={t('maxEnergy')}
                    value={`${payload.maxContractExecutionEnergy.value.toString()} ${t('nrg')}`}
                />
            )}
        </>
    );
}

/**
 * Displays an overview of a init contract transaction.
 */
function DisplayInitContract({ payload }: { payload: Omit<InitContractInput, 'param'> }) {
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
    const [decoded, setDecoded] = useState<unknown>();

    useEffect(() => {
        try {
            setDecoded(decode(payload.data.data));
        } catch {
            // display raw if unable to decode
        }
    }, []);

    const title = `${t('data')}${!decoded ? t('rawData') : ''}`;
    const value = JSONBig.stringify(decoded) || payload.data.toJSON();

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

function decodeMemo(encodedMemo?: Memo): string | undefined {
    if (!encodedMemo) return undefined;

    if (CborMemo.instanceOf(encodedMemo)) {
        const memo = CborMemo.parse(encodedMemo as CborMemo.Type) as object | string;
        return typeof memo === 'object' ? JSON.stringify(memo, null, 2) : memo;
    }

    return Cbor.decode(Cbor.fromBuffer(encodedMemo as Uint8Array))?.toString();
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function displayValue(value: any) {
    if (CcdAmount.instanceOf(value)) {
        return displayAsCcd(value.microCcdAmount);
    }
    if (CborMemo.instanceOf(value)) {
        return decodeMemo(value);
    }
    return value.toString();
}

function operationsCborDecoder(value: Cbor.Type) {
    const { t } = useTranslation('x', { keyPrefix: 'prompts.sendTransactionX.operations' });
    const getTitle = (key: TokenOperationType) => t(key) || key;

    if (Object.keys(cborDecode(value.toString())).length) {
        const decoded = Cbor.decode(value) as { [key: string]: object }[];

        const operationsList = decoded.map((item) => {
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
            <Card.RowDetails title={t('operations')} value={operationsCborDecoder(payload.operations)} />
        </>
    );
}

/**
 * Displays an overview of configure delegation payload.
 */
function DisplayConfigureDelegationPayload({ payload }: { payload: ConfigureDelegationPayload }) {
    const { t } = useTranslation('x', { keyPrefix: 'prompts.sendTransactionX.delegation' });
    const { stake, restakeEarnings, delegationTarget } = payload;
    let delegateType;
    let bakerId;

    if (delegationTarget && 'delegateType' in delegationTarget) {
        delegateType = delegationTarget.delegateType;
    }

    if (delegationTarget && 'bakerId' in delegationTarget) {
        bakerId = delegationTarget.bakerId;
    }

    return (
        <>
            <Card.RowDetails title={t('amount')} value={displayAsCcd(stake || 0n)} />
            <Card.RowDetails title={t('restake')} value={restakeEarnings?.toString()} />
            {delegateType && <Card.RowDetails title={t('type')} value={delegateType.toString()} />}
            {bakerId && <Card.RowDetails title={t('bakerId')} value={bakerId.toString()} />}
        </>
    );
}

function LockControllerDisplay(controllerVersion: LockController.Variant, controller: LockController.SimpleV0) {
    const { t } = useTranslation('x', { keyPrefix: 'prompts.sendTransactionX.lockOperations' });
    if (controllerVersion === LockController.Variant.SimpleV0) {
        const {
            [LockController.Variant.SimpleV0]: { tokens, grants, memo, keepAlive },
        } = controller;

        const memoString = decodeMemo(memo);
        const keepAliveValue = typeof keepAlive === 'boolean' ? keepAlive.toString() : undefined;

        return (
            <>
                <Card.RowDetails title={t('type')} value={t('simpleLock')} />
                <Card.RowDetails title={t('tokens')} value={tokens.join(', ')} />
                {keepAliveValue && <Card.RowDetails title={t('keepAlive')} value={keepAliveValue} />}
                {memoString && <Card.RowDetails title={t('memo')} value={memoString} />}
                <Card.RowDetails
                    title={t('grants')}
                    value={grants
                        .map(
                            ({ roles, account: { address } }) =>
                                `${t('account')}: ${address.toString()}\n${t('roles')}: ${roles.join(', ')}`
                        )
                        .join('\n-----\n')}
                />
            </>
        );
    }
    return (
        <Card.Row>
            <Text.Capture>{t('cannotRenderLockVariant')}</Text.Capture>
        </Card.Row>
    );
}

function OperationLockCreate({ lockCreate }: LockCreateOperation) {
    const { t } = useTranslation('x', { keyPrefix: 'prompts.sendTransactionX.lockOperations' });

    const getRecipients = () => {
        if (lockCreate.recipients === 'any') {
            return t('anyAccount');
        }
        return lockCreate.recipients.map(({ address }) => address).join('\n');
    };

    return (
        <Card key="lockCreate">
            <Card.Row>
                <Text.MainMedium>{t('lockCreate')}</Text.MainMedium>
            </Card.Row>
            <Card.RowDetails title={t('recipients')} value={getRecipients()} />
            <Card.RowDetails
                title={t('expiry')}
                value={TransactionExpiry.toDate(lockCreate.expiry.expiry).toString()}
            />
            <Card.RowDetails
                title={t('controller')}
                value={Object.entries(lockCreate.controller).map(([controllerVersion, controller]) =>
                    LockControllerDisplay(controllerVersion as LockController.Variant, {
                        [controllerVersion as LockController.Variant]: controller,
                    })
                )}
            />
        </Card>
    );
}

function OperationGeneric({ operation }: { operation: MetaUpdateOperation | UnknownMetaUpdateOperation }) {
    const { t } = useTranslation('x', { keyPrefix: 'prompts.sendTransactionX.lockOperations' });
    // Second argument in t(key, key) is default value
    // In case of no translation it will return just last key, instead of full path to key
    // Example: getTitle('keyWithNoTranslation') -> keyWithNoTranslation, instead of prompts.sendTransactionX.lockOperations.keyWithNoTranslation
    const getTitle = (key: MetaUpdateOperationType) => t(key, key) || key;
    const [operationType, operationPayload] = Object.entries(operation)[0] ?? [];

    if (!operationType) {
        return null;
    }

    return (
        <Card key={operationType}>
            <Card.Row>
                <Text.MainMedium>{getTitle(operationType as MetaUpdateOperationType)}</Text.MainMedium>
            </Card.Row>
            {operationPayload && typeof operationPayload === 'object' ? (
                Object.entries(operationPayload).map(([key, value]) => (
                    <Card.RowDetails
                        key={key}
                        title={getTitle(key as MetaUpdateOperation[keyof MetaUpdateOperation])}
                        value={displayValue(value)}
                    />
                ))
            ) : (
                <Card.RowDetails value={displayValue(operationPayload)} />
            )}
        </Card>
    );
}

function isLockCreateOperation(
    operation: MetaUpdateOperation | UnknownMetaUpdateOperation
): operation is LockCreateOperation {
    return Object.prototype.hasOwnProperty.call(operation, MetaUpdateOperationType.LockCreate);
}

function getMetaUpdateOperationKey(operation: MetaUpdateOperation | UnknownMetaUpdateOperation) {
    return Object.keys(operation)[0] ?? 'unknown';
}

function MetaUpdateOperationDisplay({ operation }: { operation: MetaUpdateOperation | UnknownMetaUpdateOperation }) {
    if (isLockCreateOperation(operation)) {
        return <OperationLockCreate {...operation} />;
    }

    return <OperationGeneric operation={operation} />;
}

/**
 * Displays an overview of any transaction payload.
 */
function DisplayMetaUpdatePayload({ payload }: { payload: MetaUpdatePayload }) {
    const { t } = useTranslation('x', { keyPrefix: 'prompts.sendTransactionX.payload' });
    const decoded = decodeMetaUpdateOperations(payload.operations);
    return (
        <Card.RowDetails
            title={t('operations')}
            value={decoded.map((operation) => (
                <MetaUpdateOperationDisplay key={getMetaUpdateOperationKey(operation)} operation={operation} />
            ))}
        />
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
            return <DisplayUpdateContract payload={payload as UpdateContractInput} />;
        case AccountTransactionType.InitContract:
            return <DisplayInitContract payload={payload as InitContractInput} />;
        case AccountTransactionType.RegisterData:
            return <DisplayRegisterData payload={payload as RegisterDataPayload} />;
        case AccountTransactionType.DeployModule:
            return <DisplayDeployModule payload={payload as DeployModulePayload} />;
        case AccountTransactionType.TokenUpdate:
            return <DisplayTokenUpdate payload={payload as TokenUpdatePayload} />;
        case AccountTransactionType.ConfigureDelegation:
            return <DisplayConfigureDelegationPayload payload={payload as ConfigureDelegationPayload} />;
        case AccountTransactionType.MetaUpdate:
            return <DisplayMetaUpdatePayload payload={payload as MetaUpdatePayload} />;
        default:
            return <DisplayGenericPayload payload={payload} />;
    }
}
