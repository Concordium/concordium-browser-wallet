import { ConfigureDelegationPayload, DelegationTarget, DelegationTargetType } from '@concordium/web-sdk';
import { AmountForm } from '@popup/popupX/shared/Form/TokenAmount';
import { parseCcdAmount } from '@popup/popupX/shared/utils/helpers';

/** Describes the form values for configuring the delegation target of a delegation transaction */
export type DelegationTypeForm = {
    /** The target for the delegation */
    type: DelegationTargetType;
    /** The target baker ID - only relevant for target = {@linkcode DelegationTargetType.Baker} */
    bakerId?: string;
};

/** The form values for delegator stake configuration step */
export type DelegatorStakeForm = AmountForm & {
    /** Whether to add rewards to the stake or not */
    redelegate: boolean;
};

/** Represents the form data for a configure delegator transaction. */
export type DelegatorForm = {
    /** The delegation target configuration */
    target: DelegationTypeForm;
    /** The delegation stake configuration */
    stake: DelegatorStakeForm;
};

/** Constructs a {@linkcode ConfigureDelegationPayload} from the corresponding {@linkcode DelegatorForm} */
export function configureDelegatorPayloadFromForm(values: DelegatorForm): ConfigureDelegationPayload {
    let delegationTarget: DelegationTarget;
    if (values.target.type === DelegationTargetType.PassiveDelegation) {
        delegationTarget = { delegateType: DelegationTargetType.PassiveDelegation };
    } else if (values.target.bakerId === undefined) {
        throw new Error('Expected bakerId to be defined');
    } else {
        delegationTarget = { delegateType: DelegationTargetType.Baker, bakerId: BigInt(values.target.bakerId) };
    }

    return {
        restakeEarnings: values.stake.redelegate,
        stake: parseCcdAmount(values.stake.amount),
        delegationTarget,
    };
}
