const t = {
    root: {
        bakerTitle: 'Validation',
        bakerDescription:
            'As a baker, you can participate in the network by baking blocks on the Concordium network. This requires a minimum of {{amount}} CCD and access to a dedicated node.',
        bakerAction: 'Continue to validation setup',
        delegationTitle: 'Delegation',
        delegationDescription:
            'If you don’t have access to your own node, you may delegate your stake to one of the other bakers. There is no minimum amount of CCD required when delegating.',
        delegationAction: 'Continue to delegation setup',
        note: 'Please note, a single account cannot both be a baker and a delegator, but it is possible to stop one and change to the other.',
    },
};

export default t;
