import type en from './en';

const t: typeof en = {
    intro: {
        description:
            'Hvis du mangler nogle identiteter eller konti i din wallet, kan du prøve at søge efter dem her \n\n Hvis du har brugt dit hemmelige recovery phrase til at lave flere identiteter og konti i en anden installation af en Concordium wallet, kan du også bruge denne funktion til at tilføje dem her.',
    },
    main: {
        title: 'Genskaber din wallet',
        description: 'Vent venligt mens der søges efter dine identiteter og konti.',
    },
    finish: {
        success: 'Følgende identiteter og konti blev fundet.',
        error: 'Genskabning fejlede. Du kan prøve igen. \n Årsag til fejlen:',
        noneFound: 'Ingen identiteter blev fundet.',
        errorAccountInfo: 'Fejl ved hentning af kontoens balance',
    },
    continue: 'Fortsæt',
    retry: 'Prøv igen',
    restore: 'Restore',
};

export default t;
