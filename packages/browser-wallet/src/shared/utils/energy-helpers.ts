import {
    AccountTransactionPayload,
    AccountTransactionType,
    calculateEnergyCost,
    ConfigureDelegationPayload,
    ChainParameters,
    getAccountTransactionHandler,
    Ratio,
} from '@concordium/web-sdk';
import { collapseRatio, multiplyRatio } from './number-helpers';

export const SIMPLE_TRANSFER_ENERGY_TOTAL_COST = 501n;
const CONFIGURE_DELEGATION_BASE_COST = 300n;
const CONFIGURE_DELEGATION_MAX_PAYLOAD_SIZE = 20n; // (2 + 8 + 1 + 1 + 8);

// TODO: replace this with helpers from SDK
export function determineUpdatePayloadSize(parameterSize: number, receiveName: string) {
    return 8n + 8n + 8n + 2n + BigInt(parameterSize) + 2n + BigInt(receiveName.length);
}

/**
 * Given a transaction type and the payload of that transaction type, return the corresponding energy cost.
 */
export function getEnergyCost(transactionType: AccountTransactionType, payload: AccountTransactionPayload): bigint {
    const handler = getAccountTransactionHandler(transactionType);
    const size = handler.serialize(payload).length;
    return calculateEnergyCost(1n, BigInt(size), handler.getBaseEnergyCost(payload));
}

/**
 * Given the current blockchain parameters, return the microCCD per NRG exchange rate of the chain.
 * @returns the microCCD per NRG exchange rate as a ratio.
 */
export function getExchangeRate({ euroPerEnergy, microGTUPerEuro }: ChainParameters): Ratio {
    const denominator = BigInt(euroPerEnergy.denominator * microGTUPerEuro.denominator);
    const numerator = BigInt(euroPerEnergy.numerator * microGTUPerEuro.numerator);
    return { numerator, denominator };
}

/**
 * Given an NRG amount and the current blockchain parameters, this returns the corresponding amount in microCcd.
 */
export function convertEnergyToMicroCcd(cost: bigint, chainParameters: ChainParameters): bigint {
    const rate = getExchangeRate(chainParameters);
    return collapseRatio(multiplyRatio(rate, cost));
}

export function getConfigureDelegationEnergyCost(payload: ConfigureDelegationPayload): bigint {
    return getEnergyCost(AccountTransactionType.ConfigureDelegation, payload);
}

export function getConfigureDelegationMaxEnergyCost(): bigint {
    return calculateEnergyCost(1n, CONFIGURE_DELEGATION_MAX_PAYLOAD_SIZE, CONFIGURE_DELEGATION_BASE_COST);
}
