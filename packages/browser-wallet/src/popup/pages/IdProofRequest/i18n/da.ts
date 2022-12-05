import en from './en';

const da: typeof en = {
    header: '{{dappName}} anmoder om følgende information om dig:',
    accept: 'Godkend',
    reject: 'Afvis',
    displayStatement: {
        requirementsMet: 'Du opfylder kravet',
        requirementsNotMet: 'Du opfylder ikke kravet',
        revealDescription:
            '<1>Vigtigt:</1> {{dappName}} får adgang til alt information der står ovenfor. Du skal kun acceptere at afsløre informationen, hvis du har tillid til servicen og hvis du er bekendt med deres privathedspolitik.',
        revealTooltip: {
            header: 'Afslører information <1 />',
            // TODO: translate
            body: 'When you reveal information for a third party, you effectlively hand over the information to them. This means that you should only do this if you have absolute trust in them, and if you are familiar with their data usage and protection procedures.\n\nYou can read more in on\n\ndeveleoper.concordium.software',
        },
        secretTooltip: {
            header: 'Hemmelige beviser',
            // TODO: translate
            body: 'Secret proofs are a way of proving something to a service or dApp without revealing the exact personal information. One example can be that you prove that you are over 18 years old without revealing your exact date of birth. Another example could be that you live in one of a range of countries without revealing exactly which country you live in.\n\nYou can read more on\n\n developer.concordium.software',
        },
        headers: {
            reveal: 'Information der afsløres',
            age: 'Hemmeligt bevis for alder',
            dob: 'Hemmeligt bevis for fødselsdato',
            idValidity: 'Hemmeligt bevis for ID validitet',
            nationality: 'Hemmeligt bevis for nationalitet',
            residence: 'Hemmeligt bevis for bopælsland',
            idDocType: 'Hemmeligt bevis for identitetsdokumenttype',
            idDocIssuer: 'Hemmeligt bevis for identitetsdokumentudsteder',
        },
        names: {
            age: 'Alder',
            dob: 'F.D',
            idValidTo: 'ID gyldigt indtil tidligst',
            idValidFrom: 'ID gyldigt fra',
            nationality: 'Nationalitet',
            residence: 'Bopælsland',
            docType: 'Dokumenttype',
            docIssuer: 'Dokumentudsteder',
        },
        proofs: {
            ageMin: 'Mere end {{age}} år gammel',
            ageMax: 'Mindre end {{age}} år gammel',
            ageBetween: 'Mellem {{ageMin}} og {{ageMax}} år gammel',
            dobMin: 'Efter {{dobString}}',
            dobMax: 'Før {{dobString}}',
            dobBetween: 'Mellem {{minDobString}} og {{maxDobString}}',
            idValidity: '{{dateString}}',
            nationalityEU: 'EU',
            nationalityNotEU: 'Udenfor EU',
            nationality: '1 af {{n}} lande',
            notNationality: 'Ingen af {{n}} lande',
            docType: '1 af {{n}} typer',
            notDocType: 'Ingen af {{n}} typer',
            docIssuer: '1 af {{n}} udstedere',
            notDocIssuer: 'Ingen af {{n}} udstedere',
        },
        descriptions: {
            ageMin: 'Din fødselsdato er før {{dateString}}',
            ageMax: 'Din fødselsdato er efter {{dateString}}',
            ageBetween: 'Din fødselsdato er mellem {{minDateString}} og {{maxDateString}}',
            nationalityEU: 'Du er statsborger i et EU land',
            nationalityNotEU: 'Du er IKKE statsborger i et EU land',
            nationality: 'Du er statsborger i et af følgende lande:\n{{countryNamesString}}',
            notNationality: 'Du er IKKE statsborger i et af følgende lande:\n{{countryNamesString}}',
            residence: 'Dit bopælsland er et af følgende:\n{{countryNamesString}}',
            notResidence: 'Dit bopælsland er IKKE et af følgende:\n{{countryNamesString}}',
            docType: 'Typen af dit identitetsdokument er en af følgende:\n{{typeNamesString}}',
            notDocType: 'Typen af dit identitetsdokument er IKKE en af følgende:\n{{typeNamesString}}',
            docIssuer: 'Udstederen af dit identitetsdokument er en af følgende:\n{{issuerNamesString}}',
            notDocIssuer: 'Udstederen af dit identitetsdokument er IKKE en af følgende:\n{{issuerNamesString}}',
        },
    },
    failedProof: 'Bevis kunne ikke oprettes: {{ reason }}',
};

export default da;
