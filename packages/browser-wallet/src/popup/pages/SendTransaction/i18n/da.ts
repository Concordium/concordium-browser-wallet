import type en from './en';

const t: typeof en = {
    description: 'Transaktionsoversigt',
    sender: 'Afsender',
    submit: 'Send',
    error: 'Fejl',
    deny: 'Afvis',
    receiver: 'Modtager',
    amount: 'Mængde',
    contractIndex: 'Kontrakt indeks (under indeks)',
    receiveName: 'Kontrakt og funktions navn',
    maxEnergy: 'Max energi tilladt',
    microCCD: 'mikroCCD',
    nrg: 'NRG',
    moduleReference: 'Modul reference',
    contractName: 'Kontrakt navn',
    title: 'Underskriv transaktion',
    data: 'Data',
    rawData: '(Kunne ikke afkodes)',
    errors: {
        missingAccount: 'Afsender addresse mangler',
        missingKey: 'Nøgler til afsender addresse mangler',
        insufficientFunds: 'Utilstrækkelig CCD til at kunne sende transaktionen',
        missingNonce: 'Vi var ikke i stand til at finde den næste nonce for afsenderen',
    },
    version: 'Version',
    sourceHash: 'Modul hash',
};

export default t;
