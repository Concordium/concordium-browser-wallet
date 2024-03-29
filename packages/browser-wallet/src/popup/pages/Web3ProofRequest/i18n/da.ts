import type en from './en';

const t: typeof en = {
    header: '{{dappName}} anmoder om følgende information om dig:',
    approve: 'Godkend',
    reject: 'Afvis',
    back: 'Tilbage',
    continue: 'Fortsæt',
    displayStatement: {
        requirementsMet: 'Du opfylder kravet',
        requirementsNotMet: 'Du opfylder ikke kravet',
        revealDescription:
            '<1>Vigtigt:</1> {{dappName}} får adgang til alt information der står ovenfor. Du skal kun acceptere at afsløre informationen, hvis du har tillid til servicen og hvis du er bekendt med deres privathedspolitik.',
        revealTooltip: {
            header: 'Afslører information <1 />',
            body: 'Når du afslører information til en tredjepart, kan de beholde denne information. Dette betyder, at du kun bør afsløre information til dem hvis du er bekendt med deres databrugs- samt databeskyttelses-politik.\n\nDu kan læse mere i\n<1>udvikler dokumentationen</1>.',
        },
        secretTooltip: {
            header: 'Zero-knowledge beviser',
            body: 'Zero-knowledge beviser er en måde at bevise noget overfor en service eller dApp, uden at afsløre den underliggende personlige information. Et eksempel kan være, at du beviser at du er over 18 år gammel, uden at bevise din specifikke fødselsdato. Et andet eksempel kan være, at du bor i ét ud af en række lande, uden at afsløre hvilken af disse lande du bor i.\n\nDu kan læse mere i\n<1>udvikler dokumentationen</1>.',
        },
        headers: {
            reveal: 'Information der afsløres',
            secret: 'Zero-knowledge bevis',
        },
        proofs: {
            range: 'Mellem {{ lower }} og {{ upper }}',
            membership: '1 af de følgende',
            nonMembership: 'Ingen af de følgende',
        },
        descriptions: {
            range: 'Dette vil bevise at deres {{ name }} er mellem {{ lower }} og {{ upper }}',
            membership: 'Dette vil bevise at deres {{ name }} er en af følgende:\n{{ setNames }}',
            nonMembership: 'This will prove that your {{ name }} er IKKE en af følgende:\n{{ setNames }}',
            missingAttribute: 'Denne Attribut kan ikke findes på identiteten "{{identityName}}"',
        },
    },
    select: {
        verifiableCredential: 'Vælg verifiable credential',
        accountCredential: 'Væg konto',
    },
    descriptions: {
        verifiableCredential: 'Vælg en verifiable credential til at afsløre/bevise den anmodet information.',
        accountCredential:
            'Vælg en account, hvis forbundne identity skal bruges til at afsløre/bevise den anmodet information.',
        unableToProve: 'One or more attributes do not meet the requirements from the verifier.',
        noCredentialsForThatIssuer: 'You do not hold any credentials from the issuer that the verifier requested.',
    },
    failedProof: 'Bevis kunne ikke oprettes',
    failedProofReason: 'Bevis kunne ikke oprettes: {{ reason }}',
};

export default t;
