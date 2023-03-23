import type en from './en';

const t: typeof en = {
    description: '{{ dApp }} anmoder om en signatur på følgende besked',
    descriptionWithSchema:
        '{{ dApp }} har sendt en rå besked og et schema til at oversætte den. Vi har oversat beskeden, men du burde kun underskrive hvis du stoler på {{ dApp }}',
    deserializedDisplay: 'Oversat',
    rawDisplay: 'Rå',
    sign: 'Signér',
    reject: 'Afvis',
    error: 'Fejl',
};

export default t;
