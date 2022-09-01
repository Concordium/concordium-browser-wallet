import type en from './en';

const t: typeof en = {
    title: 'Din Concordium identitet',
    abortExplanation: 'Identitets udstedelses blev afbrudt. Hvis du ikke afbrød, prøv igen eller kontakt support.',
    successExplanation:
        'Din anmodning er blevet sendt til identitets udbyderen. Det kan tage et stykke tid at bekræfte din identitiet. \n\n Når din identitet er blevet bekræftet, vil du kunn åbne en konto med den.',
    errorExplanation: 'Identitets udstedelsesen er fejlet på grund af: "{{reason}}"',
    done: 'Færdig',
    startText: 'Vælg hos hvilken identitets udbyder du ønsker at anmode en identitet.',
    alreadyPending: 'Du er allerede i gang med lave en ny identitet.',
    reset: 'Nulstil',
    startWaitingText:
        'Din anmoding er ved at blive lavet, undgå at lukke browseren. Vi åbner en fane hvor du kan gå igennem identitets udbyderen process for at lave din identitet.',
    error: 'Fejl',
};

export default t;
