const en = {
    idIssuer: {
        title: 'Request an Identity',
        description:
            'A Concordium ID is required for you to create a Concordium account. Create your secure identification through one of our trusted external providers.',
        descriptionOngoing:
            'An identity issuance process is ongoing in the browser. Please follow the steps to complete the process for the identity provider.\n\nIf you wish to abort the flow, or try again, press "Reset" below.',
        redirectInfo: 'You will be redirected after choosing an identity provider.',
        buttonContinue: 'Request Identity',
        buttonReset: 'Reset',
    },
    externalFlow: {
        description:
            'Your request is being built. Please do not close the browser. When a new tab opens from the identity provider please follow their process to create your identity.',
        descriptionOngoing:
            'An identity issuance process is ongoing in the browser. Please follow the steps to complete the process for the identity provider.\n\nIf you wish to abort the flow, or try again, press "Reset" below.',
        buttonReset: 'Reset',
    },
    failed: {
        title: 'Error',
        buttonRetry: 'Try again',
    },
    submitted: {
        title: 'Your Concordium identity',
        description:
            'Your request has been submitted to the identity provider. It may take a little while for them to confirm your identity.\n\nOnce your identity has been verified, you will be able to open an account with it.',
        buttonContinue: 'Done',
        buttonCreateAccount: 'Create Concordium Account',
    },
    aborted: {
        message:
            'The identity request was aborted. If you did not abort the process, please try again, or contact support.',
    },
    idCardsInfo: {
        ids: 'Concordium ID',
        idDescription:
            'As the only blockchain, Concordium enables you to verify your real-world identity while remaining private on chain.\n\nEvery user in the Concordium ecosystem has been verified by an identity provider (IDP) - a trusted third-party entity that is responsible for validating the real-world identity of users.\n\nThe IDP does not track your wallet or on-chain activities; they only handle the verification process.\n\nAfter a your identity is verified, the identity provider issues a cryptographic identity object to you that is linked to your account and can be used to prove your identity to others without revealing sensitive personal information.\n\nOnly in the case of a legal requirement, an authorized entity (like a regulator) can request the IDP to disclose a user’s real-world identity.',
    },
};

export default en;
