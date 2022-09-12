import type en from './en';

const t: typeof en = {
    intro: {
        description:
            'If you are missing some identities or accounts in your wallet, you can try restoring them here.\n\nIf you used your secret recovery phrase to create more identities and accounts in another installation of the Concordium wallet, you can also use this option to add them to this installation.',
    },
    main: {
        title: 'Genskaber din wallet',
        description: 'Vent venligt mens der søges efter dine identiteter og konti.',
    },
    finish: {
        success: 'Følgende identiteter og konti blev fundet.',
        error: 'Genskabning fejlede. Du kan prøve igen. \n Årsag til fejlen:',
        noneFound: 'Ingen identiteter blev fundet.',
    },
    continue: 'Fortsæt',
    retry: 'Prøv igen',
    restore: 'Restore',
};

export default t;
