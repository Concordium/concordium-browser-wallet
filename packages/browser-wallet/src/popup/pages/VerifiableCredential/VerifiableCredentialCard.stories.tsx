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
                attributes: {
                    title: 'Attributes',
                    description: 'Credential attributes',
                    type: 'object',
                    properties: {
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
    $schema: './JsonSchema2023-education-certificate.json',
    id: 'did:ccd:NETWORK:sci:INDEX:SUBINDEX/credentialEntry/76ada0ebd1e8aa5a651a0c4ac1ad3b62d3040f693722f94d61efa4fdd6ee797d',
    type: ['VerifiableCredential', 'ConcordiumVerifiableCredential', 'UniversityDegreeCredential'],
    issuer: 'did:ccd:NETWORK:sci:INDEX:SUBINDEX/issuer',
    validFrom: '2010-01-01T00:00:00Z',
    validUntil: '2030-01-01T00:00:00Z',
    credentialSubject: {
        id: 'did:ccd:pkc:76ada0ebd1e8aa5a651a0c4ac1ad3b62d3040f693722f94d61efa4fdd6ee797d',
        attributes: {
            degreeType: 'BachelorDegree',
            degreeName: 'Bachelor of Science and Arts',
            graduationDate: '2010-06-01T00:00:00Z',
        },
    },
    credentialSchema: {
        id: 'https://example-university.com/certificates/JsonSchema2023-education-certificate.json',
        type: 'JsonSchema2023',
    },
    randomness: {
        degreeType: '6490531ea308a2e661f62c4678e00bb87c9f602be7a053e910f8e44609bc5adb',
        degreeName: '29b439aa58324b2be5c5a3ceb7ba23b48397ba1d1d9081869f56ff1c96a2b32f',
        graduationDate: '2f5e0279c8ff6bcb004024dd4ba4f3e29d30ec91e3e4583855c2dae35ae83f8d',
    },
    proof: {
        type: 'Ed25519Signature2020',
        verificationMethod: 'did:ccd:pkc:12345678ad3b62d3040f693722f94d61efa4fdd6ee797dd1e8aa5a651a0c4ac1',
        proofPurpose: 'assertionMethod',
        proofValue:
            'facdb03a1d054a55808875864abc85cc41d2c32290929bbb361a710b0fda5e7f333ac33abdb1b5f0ebb5662335c34410b8e96ca6730df7eb100f814f223d0b07',
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
