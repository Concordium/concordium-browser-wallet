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
            body: 'Når du afslører information til en tredjepart, kan de beholde denne information. Dette betyder, at du kun bør afsløre information til dem hvis du stoler på dem, og er bekendt med deres databrugs- samt databeskyttelses-procedurer.\n\n Du kan læse mere på\n\n<1>developer.concordium.software</1>',
        },
        secretTooltip: {
            header: 'Zero Knowledge beviser',
            body: 'Zero Knowledge beviser er en måde at bevise noget overfor en service eller dApp, uden at afsløre den underliggende personlige information. Et eksempel kan være, at du beviser at du er over 18 år gammel, uden at bevise din specifikke fødselsdato. Et andet eksempel kan være, at du bor i ét ud af en række lande, uden at afsløre hvilken af disse lande du bor i.\n\nDu kan læse mere på\n\n<1>developer.concordium.software</1>',
        },
        headers: {
            reveal: 'Information der afsløres',
            age: 'Zero Knowledge bevis for alder',
            dob: 'Zero Knowledge bevis for fødselsdato',
            idValidity: 'Zero Knowledge bevis for ID validitet',
            nationality: 'Zero Knowledge bevis for nationalitet',
            residence: 'Zero Knowledge bevis for bopælsland',
            idDocType: 'Zero Knowledge bevis for identitetsdokumenttype',
            idDocIssuer: 'Zero Knowledge bevis for identitetsdokumentudsteder',
        },
        names: {
            age: 'Alder',
            dob: 'Fødslesdato',
            idDocExpiresAt: 'ID udløber',
            idDocIssuedAt: 'ID udstedt',
            nationality: 'Nationalitet',
            countryOfResidence: 'Bopælsland',
            idDocType: 'Dokumenttype',
            idDocIssuer: 'Dokumentudsteder',
        },
        proofs: {
            ageMin: 'Mere end {{age}} år gammel',
            ageMax: 'Mindre end {{age}} år gammel',
            ageBetween: 'Mellem {{ageMin}} og {{ageMax}} år gammel',
            dateAfter: 'Efter {{dateString}}',
            dateBefore: 'Før {{dateString}}',
            dateBetween: 'Mellem {{minDateString}} og {{maxDateString}}',
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
            ageMin: 'Dette vil bevise at din fødselsdato er før {{dateString}}',
            ageMax: 'Dette vil bevise at din fødselsdato er efter {{dateString}}',
            ageBetween: 'Dette vil bevise at din fødselsdato er mellem {{minDateString}} og {{maxDateString}}',
            nationalityEU: 'Dette vil bevise at du er statsborger i et EU land',
            nationalityNotEU: 'Dette vil bevise at du er IKKE statsborger i et EU land',
            nationality: 'Dette vil bevise at du er statsborger i et af følgende lande:\n{{countryNamesString}}',
            notNationality:
                'Dette vil bevise at du er IKKE statsborger i et af følgende lande:\n{{countryNamesString}}',
            residence: 'Dette vil bevise at dit bopælsland er et af følgende:\n{{countryNamesString}}',
            notResidence: 'Dette vil bevise at dit bopælsland er IKKE et af følgende:\n{{countryNamesString}}',
            residenceEU: 'Dette vil bevise at dit bopælsland er er EU land',
            residenceNotEU: 'Dette vil bevise at dit bopælsland er IKKE et EU land',
            docType: 'Dette vil bevise at Typen af dit identitetsdokument er en af følgende:\n{{typeNamesString}}',
            notDocType:
                'Dette vil bevise at Typen af dit identitetsdokument er IKKE en af følgende:\n{{typeNamesString}}',
            docIssuer:
                'Dette vil bevise at Udstederen af dit identitetsdokument er en af følgende:\n{{issuerNamesString}}',
            notDocIssuer:
                'Dette vil bevise at Udstederen af dit identitetsdokument er IKKE en af følgende:\n{{issuerNamesString}}',
            missingAttribute: 'Denne Attribut kan ikke findes på identiteten "{{identityName}}"',
        },
    },
    failedProof: 'Bevis kunne ikke oprettes',
    failedProofReason: 'Bevis kunne ikke oprettes: {{ reason }}',
};

export default da;
