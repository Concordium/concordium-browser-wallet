import {
    AccountTransactionPayload,
    AccountTransactionType,
    calculateEnergyCost,
    ConfigureDelegationPayload,
    ConfigureBakerPayload,
    ChainParameters,
    getAccountTransactionHandler,
    Ratio,
} from '@concordium/web-sdk';
import { METADATAURL_MAX_LENGTH } from '@shared/constants/baking';
import { collapseRatio, multiplyRatio } from './number-helpers';

export const SIMPLE_TRANSFER_ENERGY_TOTAL_COST = 501n;
const CONFIGURE_BAKER_WITH_KEYS_BASE_COST = 4050n;

// TODO: replace this with helpers from SDK
export function determineUpdatePayloadSize(parameterSize: number, receiveName: string) {
    return 8n + 8n + 8n + 2n + BigInt(parameterSize) + 2n + BigInt(receiveName.length);
}

// TODO: Replace this with helpers from SDK
/**
 * Given a transaction type and the payload of that transaction type, return the corresponding energy cost.
 */
export function getEnergyCost(transactionType: AccountTransactionType, payload: AccountTransactionPayload): bigint {
    const handler = getAccountTransactionHandler(transactionType);
    const size = handler.serialize(payload).length + 1;
    return calculateEnergyCost(1n, BigInt(size), handler.getBaseEnergyCost(payload));
}

export function getConfigureDelegationEnergyCost(payload: ConfigureDelegationPayload): bigint {
    return getEnergyCost(AccountTransactionType.ConfigureDelegation, payload);
}

export function getConfigureBakerEnergyCost(payload: ConfigureBakerPayload): bigint {
    return getEnergyCost(AccountTransactionType.ConfigureBaker, payload);
}

function getFullConfigureBakerSize(urlLength: number) {
    // Kind(1) + Bitmap(2), stake(8), restake(1), openForDelegation(1), keys(32 * 2 + 96), keyProofs(64 * 3), url(2 + urlLength), commissions(3*4)
    return BigInt(1 + 2 + 8 + 1 + 1 + 32 + 32 + 96 + 64 + 64 + 64 + 2 + urlLength + 4 + 4 + 4);
}

export function getConfigureBakerMaxEnergyCost(): bigint {
    const maxPayloadSize = getFullConfigureBakerSize(METADATAURL_MAX_LENGTH);
    return calculateEnergyCost(1n, maxPayloadSize, CONFIGURE_BAKER_WITH_KEYS_BASE_COST);
}

/**
 * Returns the minimum energy cost for a configure baker transaction, where all fields are present.
 */
export function getFullConfigureBakerMinEnergyCost(): bigint {
    const minPayloadSize = getFullConfigureBakerSize(0);
    return calculateEnergyCost(1n, minPayloadSize, CONFIGURE_BAKER_WITH_KEYS_BASE_COST);
}

// TODO: Replace this with helpers from SDK
/**
 * Given the current blockchain parameters, return the microCCD per NRG exchange rate of the chain.
 * @returns the microCCD per NRG exchange rate as a ratio.
 */
export function getExchangeRate({ euroPerEnergy, microGTUPerEuro }: ChainParameters): Ratio {
    const denominator = BigInt(euroPerEnergy.denominator * microGTUPerEuro.denominator);
    const numerator = BigInt(euroPerEnergy.numerator * microGTUPerEuro.numerator);
    return { numerator, denominator };
}

// TODO: Replace this with helpers from SDK
/**
 * Given an NRG amount and the current blockchain parameters, this returns the corresponding amount in microCcd.
 */
export function convertEnergyToMicroCcd(cost: bigint, chainParameters: ChainParameters): bigint {
    const rate = getExchangeRate(chainParameters);
    return collapseRatio(multiplyRatio(rate, cost));
}
