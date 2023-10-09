import {
    OpenStatus,
    OpenStatusText,
    AccountInfo,
    GenerateBakerKeysOutput,
    PrivateBakerKeys,
    PublicBakerKeys,
} from '@concordium/web-sdk';
import i18n from '@popup/shell/i18n';
import { toFixed } from 'wallet-common-helpers';

const fractionResolution = 100000;
const percentageModifier = fractionResolution / 100;

export const decimalToRewardFraction = (d: number | undefined) =>
    d === undefined ? undefined : d * percentageModifier;

const fractionResolutionToPercentage = (v: number) => v / percentageModifier;

export const fractionToPercentage = (d: number | undefined) =>
    d === undefined ? undefined : Math.floor(d * fractionResolution) / percentageModifier;

export function openStatusToDisplay(status: OpenStatus | OpenStatusText): string {
    switch (status) {
        case OpenStatus.OpenForAll:
        case OpenStatusText.OpenForAll:
            return i18n.t('baking.openForAll');
        case OpenStatusText.ClosedForNew:
        case OpenStatus.ClosedForNew:
            return i18n.t('baking.closedForNew');
        case OpenStatusText.ClosedForAll:
        case OpenStatus.ClosedForAll:
            return i18n.t('baking.closedForAll');
        default:
            throw new Error(`Status not supported: ${status}`);
    }
}

const formatCommission = toFixed(3);

export const displayFractionCommissionRate = (value: number) =>
    `${formatCommission(fractionResolutionToPercentage(value).toString())}%`;

type BakerKeyExport = {
    bakerId: number;
} & PrivateBakerKeys &
    PublicBakerKeys;

/**
 * Given the output generateBakerKeys and the account's accountInfo, return a object that is equivalent to the JSON, which should be provided to the node, for it to run as a baker.
 */
export function getBakerKeyExport(keysAndProofs: GenerateBakerKeysOutput, accountInfo: AccountInfo): BakerKeyExport {
    const { proofAggregation, proofElection, proofSig, ...keys } = keysAndProofs;
    return {
        // TODO Fix faulty conversion in case max account index approaches 2^53
        bakerId: Number(accountInfo.accountIndex),
        ...keys,
    };
}
