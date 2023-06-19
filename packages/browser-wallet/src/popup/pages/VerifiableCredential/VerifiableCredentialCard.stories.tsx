/* eslint-disable react/function-component-definition, react/destructuring-assignment */
import React from 'react';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import { VerifiableCredentialCard } from './VerifiableCredentialCard';

export default {
    title: 'VerifiableCredential/VerifiableCredentialCard',
    component: VerifiableCredentialCard,
} as ComponentMeta<typeof VerifiableCredentialCard>;

const schema = {
    type: 'https://w3c-ccg.github.io/vc-json-schemas/',
    version: '1.0',
    id: 'https://example-university.com/certificates/simple-education-certificate.json',
    name: 'UniversityDegreeCredential',
    author: 'did:ccd:mainnet:acc:...',
    authored: '2023-01-01T00:00:00+00:00',
    schema: {
        $schema: 'http://json-schema.org/draft-07/schema#',
        $id: 'https://example-university.com/certificates/simple-education-certificate.json',
        title: 'Education certificate',
        description: 'Simple representation of an education certificate.',
        type: 'object',
        required: ['@context', 'type', 'issuer', 'issuanceDate', 'credentialSubject'],
        properties: {
            '@context': {
                type: ['string', 'array', 'object'],
            },
            id: {
                type: 'string',
                format: 'uri',
            },
            type: {
                type: ['string', 'array'],
                items: {
                    type: 'string',
                },
            },
            issuer: {
                type: ['string', 'object'],
                format: 'uri',
                required: ['id'],
                properties: {
                    id: {
                        type: 'string',
                        format: 'uri',
                    },
                },
            },
            issuanceDate: {
                type: 'string',
                format: 'date-time',
            },
            expirationDate: {
                type: 'string',
                format: 'date-time',
            },
            validFrom: {
                type: 'string',
                format: 'date-time',
            },
            validUntil: {
                type: 'string',
                format: 'date-time',
            },
            credentialSubject: {
                type: 'object',
                properties: {
                    id: {
                        title: 'id',
                        type: 'string',
                        description: 'Credential subject identifier',
                    },
                    degreeType: {
                        title: 'Degree type',
                        type: 'string',
                        description: 'Degree type',
                        index: '0',
                    },
                    degreeName: {
                        title: 'Degree name',
                        type: 'string',
                        description: 'Degree name',
                        index: '1',
                    },
                    graduationDate: {
                        type: 'string',
                        format: 'date-time',
                        description: 'Graduation date',
                        index: '2',
                        title: 'Graduation date',
                    },
                },
                required: ['id', 'degreeType', 'degreeName', 'graduationDate'],
            },
            credentialSchema: {
                type: 'object',
                required: ['id', 'type'],
                properties: {
                    id: {
                        type: 'string',
                        format: 'uri',
                    },
                    type: {
                        type: 'string',
                    },
                },
            },
        },
    },
    proof: '',
};

const verifiableCredential = {
    '@context': ['https://www.w3.org/2018/credentials/v1', 'Concordium VC URI'],
    id: 'did:ccd:NETWORK:sci:INDEX:SUBINDEX/credentialEntry/ff4aa77af80b4d72973ccb957d180746',
    type: ['VerifiableCredential', 'UniversityDegreeCredential'],
    issuer: 'did:ccd:NETWORK:sci:INDEX:SUBINDEX/issuer',
    issuanceDate: '2010-01-01T00:00:00Z',
    credentialSubject: {
        id: 'did:ccd:pkc:ebfeb1f712ebc6f1c276e12ec21',
        degreeType: 'Bachelor degree',
        degreeName: 'Bachelor of Science and Arts',
        graduationDate: '2010-06-01T00:00:00Z',
    },
    credentialSchema: {
        id: 'https://example-university.com/certificates/simple-education-certificate.json',
        type: 'CredentialSchema2022', // the same for all schemas
    },
};

export const Primary: ComponentStory<typeof VerifiableCredentialCard> = () => {
    return (
        <div style={{ width: 354 }}>
            <VerifiableCredentialCard credential={verifiableCredential} schema={schema} />
        </div>
    );
};
