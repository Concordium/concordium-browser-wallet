/* eslint-disable react/function-component-definition, react/destructuring-assignment */
import React from 'react';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import { VerifiableCredentialSchema, VerifiableCredentialStatus } from '@shared/storage/types';
import { VerifiableCredentialMetadata } from '@shared/utils/verifiable-credential-helpers';
import { VerifiableCredentialCard } from './VerifiableCredentialCard';

export default {
    title: 'VerifiableCredential/VerifiableCredentialCard',
    component: VerifiableCredentialCard,
} as ComponentMeta<typeof VerifiableCredentialCard>;

const schema: VerifiableCredentialSchema = {
    $id: 'https://example-university.com/certificates/JsonSchema2023-education-certificate.json',
    $schema: 'https://json-schema.org/draft/2020-12/schema',
    name: 'Education certificate',
    description: 'Simple representation of an education certificate.',
    type: 'object',
    properties: {
        credentialSubject: {
            type: 'object',
            properties: {
                id: {
                    title: 'Credential subject id',
                    type: 'string',
                    description: 'Credential subject identifier',
                },
                degreeType: {
                    title: 'Degree Hello',
                    type: 'string',
                    description: 'Degree type',
                },
                degreeName: {
                    title: 'Degree name',
                    type: 'string',
                    description: 'Degree name',
                },
                graduationDate: {
                    title: 'Graduation date',
                    type: 'string',
                    format: 'date-time',
                    description: 'Graduation date',
                },
            },
            required: ['id', 'degreeType', 'degreeName', 'graduationDate'],
        },
    },
    required: ['credentialSubject'],
};

const metadata: VerifiableCredentialMetadata = {
    title: 'Education Certificate v2',
    logo: {
        url: 'https://img.logoipsum.com/298.svg',
        hash: '1c74f7eb1b3343a5834e60e9a8fce277f2c7553112accd42e63fae7a09e0caf8',
    },
    background_color: '#003d73',
    image: {
        url: 'https://picsum.photos/327/120',
    },
    localization: {
        'da-DK': {
            url: 'https://location.of/the/danish/metadata.json',
            hash: '624a1a7e51f7a87effbf8261426cb7d436cf597be327ebbf113e62cb7814a34b',
        },
    },
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
        <div style={{ width: 375 }}>
            <VerifiableCredentialCard
                credential={verifiableCredential}
                schema={schema}
                credentialStatus={VerifiableCredentialStatus.Active}
                metadata={metadata}
            />
        </div>
    );
};
