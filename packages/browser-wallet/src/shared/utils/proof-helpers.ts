import { AtomicStatement, StatementTypes } from '@concordium/web-sdk';
import { ConfirmedIdentity } from '@shared/storage/types';

export function canProveStatement(statement: AtomicStatement, identity: ConfirmedIdentity) {
    const attribute = identity.idObject.value.attributeList.chosenAttributes[statement.attributeTag];

    switch (statement.type) {
        case StatementTypes.AttributeInSet:
            return statement.set.includes(attribute);
        case StatementTypes.AttributeNotInSet:
            return !statement.set.includes(attribute);
        case StatementTypes.AttributeInRange:
            return statement.upper > attribute && attribute >= statement.lower;
        case StatementTypes.RevealAttribute:
            return attribute !== undefined;
        default:
            throw new Error(`Statement type of ${statement.type} is not supported`);
    }
}
