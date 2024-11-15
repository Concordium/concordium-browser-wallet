const en = {
    idIssuer: {
        title: 'Request an identity',
        description:
            'The ID Documents (e.g. Passport pictures) that are used for the ID verification, are held exclusively by our trusted, third-party identity providers in their own off-chain records.\n\nChoose one of the identity providers below to request a Concordium Identity and create an account.',
        buttonContinue: 'Request Identity',
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
    },
    aborted: {
        message:
            'The identity request was aborted. If you did not abort the process, please try again, or contact support.',
    },
};

export default en;
