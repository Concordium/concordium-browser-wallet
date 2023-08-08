/* eslint-disable react/function-component-definition, react/destructuring-assignment */
import React from 'react';
import { ComponentMeta, ComponentStory } from '@storybook/react';
import { VerifiableCredentialStatus, VerifiableCredentialSchema } from '@shared/storage/types';
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
                    required: ['degreeType', 'degreeName', 'graduationDate'],
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
            required: ['id'],
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

const credentialSubject = {
    id: 'did:ccd:pkc:76ada0ebd1e8aa5a651a0c4ac1ad3b62d3040f693722f94d61efa4fdd6ee797d',
    attributes: {
        degreeType: 'BachelorDegree',
        degreeName: 'Bachelor of Science and Arts',
        graduationDate: '2010-06-01T00:00:00Z',
    },
};

export const Primary: ComponentStory<typeof VerifiableCredentialCard> = () => {
    return (
        <div style={{ width: 375 }}>
            <VerifiableCredentialCard
                credentialSubject={credentialSubject}
                schema={schema}
                credentialStatus={VerifiableCredentialStatus.Active}
                metadata={metadata}
            />
        </div>
    );
};
