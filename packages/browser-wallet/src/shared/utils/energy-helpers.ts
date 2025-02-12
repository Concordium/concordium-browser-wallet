import {
    AccountTransactionType,
    calculateEnergyCost,
    ConfigureDelegationPayload,
    ConfigureBakerPayload,
    getEnergyCost,
    Energy,
} from '@concordium/web-sdk';
import { METADATAURL_MAX_LENGTH } from '@shared/constants/baking';

export const SIMPLE_TRANSFER_ENERGY_TOTAL_COST = 501n;
const CONFIGURE_BAKER_WITH_KEYS_BASE_COST = 4050n;

// TODO: replace this with helpers from SDK
export function determineUpdatePayloadSize(parameterSize: number, receiveName: string) {
    return 8n + 8n + 8n + 2n + BigInt(parameterSize) + 2n + BigInt(receiveName.length) + 1n;
}

export function getConfigureDelegationEnergyCost(payload: ConfigureDelegationPayload): Energy.Type {
    return getEnergyCost(AccountTransactionType.ConfigureDelegation, payload);
}

export function getConfigureBakerEnergyCost(payload: ConfigureBakerPayload): Energy.Type {
    return getEnergyCost(AccountTransactionType.ConfigureBaker, payload);
}

function getFullConfigureBakerSize(urlLength: number) {
    // Kind(1) + Bitmap(2), stake(8), restake(1), openForDelegation(1), keys(32 * 2 + 96), keyProofs(64 * 3), url(2 + urlLength), commissions(3*4)
    return BigInt(1 + 2 + 8 + 1 + 1 + 32 + 32 + 96 + 64 + 64 + 64 + 2 + urlLength + 4 + 4 + 4);
}

export function getConfigureBakerMaxEnergyCost(): Energy.Type {
    const maxPayloadSize = getFullConfigureBakerSize(METADATAURL_MAX_LENGTH);
    return calculateEnergyCost(1n, maxPayloadSize, CONFIGURE_BAKER_WITH_KEYS_BASE_COST);
}

/**
 * Returns the minimum energy cost for a configure baker transaction, where all fields are present.
 */
export function getFullConfigureBakerMinEnergyCost(): Energy.Type {
    const minPayloadSize = getFullConfigureBakerSize(0);
    return calculateEnergyCost(1n, minPayloadSize, CONFIGURE_BAKER_WITH_KEYS_BASE_COST);
}
