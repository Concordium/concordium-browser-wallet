import type en from './en';

const t: typeof en = {
    description: '{{ dApp }} anmoder om en signatur på følgende besked',
    descriptionWithSchema:
        '{{ dApp }} har sendt en rå besked og et schema til at oversætte den. Vi har oversat beskeden, men du burde kun underskrive hvis du stoler på {{ dApp }}',
    unableToDeserialize: 'Det var ikke muligt at oversætte beskeden',
    contractIndex: 'Kontrakt indeks (under indeks)',
    receiveName: 'Kontrakt og funktions navn',
    parameter: 'Parameter',
    nonce: 'Nonce',
    expiry: 'Udløber',
    sign: 'Signér',
    reject: 'Afvis',
};

export default t;
