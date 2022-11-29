import en from './en';

const da: typeof en = {
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
    },
    failedProof: 'Bevis kunne ikke oprettes: {{ reason }}',
};

export default da;
