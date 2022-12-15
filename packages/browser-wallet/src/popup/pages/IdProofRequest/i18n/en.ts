export default {
    header: '{{dappName}} requests the following information about you:',
    accept: 'Accept',
    reject: 'Reject',
    displayStatement: {
        requirementsMet: 'You meet this requirement',
        requirementsNotMet: "You don't meet this requirement",
        revealDescription:
            '<1>Important:</1> {{dappName}} will be given all the information above. You should only accept, if you have absolute trust in the service, and if you are familiar with their privacy policy.',
        revealTooltip: {
            header: 'Revealing information <1 />',
            body: 'When you reveal information to a third party, you effectively hand over the information to them. This means you should only do this if you agree to their data usage and protection policies..\n\nYou can read more in\n\n<1>our developer documentation</1>',
        },
        secretTooltip: {
            header: 'Zero Knowledge proofs',
            body: 'Zero Knowledge proofs are a way of proving something to a service or dApp without revealing the exact personal information. One example can be that you prove that you are over 18 years old without revealing your exact age. Another example could be proving your residency is within a given set of countries without revealing which of those countries you reside within.\n\nYou can read more in\n\n<1>our developer documentation</1>',
        },
        headers: {
            reveal: 'Information to reveal',
            age: 'Zero Knowledge proof of age',
            dob: 'Zero Knowledge proof of date of birth',
            idValidity: 'Zero Knowledge proof of ID validity',
            nationality: 'Zero Knowledge proof of nationality',
            residence: 'Zero Knowledge proof of country of residence',
            idDocType: 'Zero Knowledge proof of identity document type',
            idDocIssuer: 'Zero Knowledge proof of identity document issuer',
        },
        names: {
            age: 'Age',
            dob: 'Date of birth',
            idDocExpiresAt: 'ID expires',
            idDocIssuedAt: 'ID issued',
            nationality: 'Nationality',
            countryOfResidence: 'Country of residence',
            idDocType: 'Document type',
            idDocIssuer: 'Document issuer',
        },
        proofs: {
            ageMin: 'More than {{age}} years old',
            ageMax: '{{age}} years old or less',
            ageBetween: '{{ageMin}} to {{ageMax}} years old',
            ageExact: '{{ age }} years old',
            dateAfterIncl: '{{dateString}} or later',
            dateBefore: 'Before {{dateString}}',
            dateBetween: '{{minDateString}} to {{maxDateString}}',
            nationalityEU: 'EU',
            nationalityNotEU: 'Outside EU',
            nationality: '1 of {{n}} countries',
            notNationality: 'None of {{n}} countries',
            docType: '1 of {{n}} types',
            notDocType: 'None of {{n}} types',
            docIssuer: '1 of {{n}} issuers',
            notDocIssuer: 'None of {{n}} issuers',
        },
        descriptions: {
            dob: 'This will prove that your date of birth is between {{minDateString}} and (excluding) {{maxDateString}}',
            idDocIssuedAt:
                'This will prove that your ID document was issued between {{minDateString}} and (excluding) {{maxDateString}}',
            idDocExpiresAt:
                'This will prove that your ID document expires between {{minDateString}} and (excluding) {{maxDateString}}',
            nationality: 'This will prove that you are a national of one of these countries:\n{{countryNamesString}}',
            notNationality:
                'This will prove that you are NOT a national of one of these countries:\n{{countryNamesString}}',
            residence:
                'This will prove that your country of residence is one of the following:\n{{countryNamesString}}',
            notResidence:
                'This will prove that your country of residence is NOT one of the following:\n{{countryNamesString}}',
            docType: 'This will prove that your identity document type is one of the following:\n{{typeNamesString}}',
            notDocType:
                'This will prove that your identity document type is NOT one of the following:\n{{typeNamesString}}',
            docIssuer:
                'This will prove that your identity document issuer is one of the following:\n{{issuerNamesString}}',
            notDocIssuer:
                'This will prove that your identity document issuer is NOT one of the following:\n{{issuerNamesString}}',
            missingAttribute: 'The attribute cannot be found on the identity "{{identityName}}"',
        },
    },
    failedProof: 'Unable to create proof',
    failedProofReason: 'Unable to create proof due to: {{ reason }}',
};
