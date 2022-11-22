import { AtomicStatement, RevealStatement } from '@popup/shared/idProofTypes'; // TODO: get from SDK, remove file after

export type SecretStatement = Exclude<AtomicStatement, RevealStatement>;

export function useStatementHeader(statement: SecretStatement): string {
    return `This is the header: ${statement.attributeTag}`;
}

export function useStatementDescription(statement: SecretStatement): string | undefined {
    return `This is the description: ${statement.attributeTag}`;
}
