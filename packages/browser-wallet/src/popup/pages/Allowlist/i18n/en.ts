const t = {
    empty: 'You do not currently have any services in your allowlist.',
    entry: {
        header: 'Allowlisting a service',
        description:
            'Allowlisting a service means that it can request identity proofs and signatures from selected accounts.',
        addDescription: 'Select accounts to share with the service below.',
        modifyDescription:
            'You can modify which accounts are accessible to the service below. Any allowlisted service can request proofs.',
    },
    editor: {
        removeButton: 'Remove service from allowlist',
        modal: {
            header: 'Remove service?',
            description:
                'Removing a service means that it cannot request credential proofs, or ask you to sign transactions anymore.',
            keep: 'Keep',
            remove: 'Remove',
        },
    },
};

export default t;
