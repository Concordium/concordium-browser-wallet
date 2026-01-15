import {
    AccountAddress,
    AccountTransactionType,
    AttributeKey,
    BakerKeysWithProofs,
    CcdAmount,
    ConfigureBakerPayload,
    ConfigureDelegationPayload,
    ContractAddress,
    ContractName,
    DataBlob,
    DelegationTargetBaker,
    DelegationTargetType,
    DeployModulePayload,
    Energy,
    EntrypointName,
    getAccountTransactionHandler,
    IdStatementBuilder,
    InitContractInput,
    ModuleReference,
    OpenStatus,
    Parameter,
    ReceiveName,
    RegisterDataPayload,
    SchemaVersion,
    SimpleTransferPayload,
    SimpleTransferWithMemoPayload,
    UpdateContractInput,
    UpdateCredentialsInput,
} from '@concordium/web-sdk';
import {
    SendTransactionInitContractPayload,
    SendTransactionUpdateContractPayload,
    SignMessageObject,
    SmartContractParameters,
} from '@concordium/browser-wallet-api-helpers';
import {
    sanitizeSignMessageInput,
    sanitizeAddCIS2TokensInput,
    sanitizeRequestIdProofInput,
    sanitizeSendTransactionInput,
    SanitizedSignMessageInput,
    SanitizedAddCIS2TokensInput,
    SanitizedRequestIdProofInput,
    InitContractPayloadV0,
    SanitizedSendTransactionInput,
    InitContractPayloadV1,
    InitContractPayloadV2,
    UpdateContractPayloadV0,
    UpdateContractPayloadV1,
    DeployModulePayloadV0,
    SimpleTransferPayloadV0,
    SimpleTransferPayloadV1,
    SimpleTransferWithMemoPayloadV0,
    SimpleTransferWithMemoPayloadV1,
    ConfigureBakerPayloadV0,
    ConfigureDelegationPayloadV0,
} from '../src/wallet-api/compatibility';

const accountAddress = '4UC8o4m8AgTxt5VBFMdLwMCwwJQVJwjesNzW7RPXkACynrULmd';

describe(sanitizeSignMessageInput, () => {
    test('Returns expected format', () => {
        const message = 'Test message';

        const expected: SanitizedSignMessageInput = {
            accountAddress: AccountAddress.fromBase58(accountAddress),
            message,
        };

        let result = sanitizeSignMessageInput(AccountAddress.fromBase58(accountAddress), message);
        expect(result).toEqual(expected);

        result = sanitizeSignMessageInput(accountAddress, message);
        expect(result).toEqual(expected);

        const wrappedMessage: SignMessageObject = {
            data: '010102',
            schema: '',
        };
        result = sanitizeSignMessageInput(accountAddress, wrappedMessage);
        expect(result).toEqual({ ...expected, message: wrappedMessage });
    });
});

describe(sanitizeAddCIS2TokensInput, () => {
    test('Returns expected format', () => {
        const tokenIds = ['01', '02'];
        const contractIndex = 10n;

        const expected: SanitizedAddCIS2TokensInput = {
            tokenIds,
            accountAddress: AccountAddress.fromBase58(accountAddress),
            contractAddress: ContractAddress.create(contractIndex),
        };

        let result = sanitizeAddCIS2TokensInput(accountAddress, tokenIds, contractIndex, 0n);
        expect(result).toEqual(expected);

        result = sanitizeAddCIS2TokensInput(
            AccountAddress.fromBase58(accountAddress),
            tokenIds,
            ContractAddress.create(contractIndex)
        );
        expect(result).toEqual(expected);
    });
});

describe(sanitizeRequestIdProofInput, () => {
    test('Returns expected format', () => {
        const statement = new IdStatementBuilder().addMinimumAge(18).getStatement();
        const challenge = '000102';

        const expected: SanitizedRequestIdProofInput = {
            accountAddress: AccountAddress.fromBase58(accountAddress),
            statement,
            challenge,
        };

        let result = sanitizeRequestIdProofInput(accountAddress, statement, challenge);
        expect(result).toEqual(expected);

        result = sanitizeRequestIdProofInput(AccountAddress.fromBase58(accountAddress), statement, challenge);
        expect(result).toEqual(expected);
    });
});

describe(sanitizeSendTransactionInput, () => {
    const maxContractExecutionEnergy = 30000n;
    const contractName = 'SomeContract';
    const entrypointName = 'someReceive';
    const contractIndex = 10n;
    const contractSubindex = 0n;
    const amount = 100n;

    test('Returns expected format (barring transaction payload)', () => {
        const payload: SendTransactionUpdateContractPayload = {
            amount: CcdAmount.fromMicroCcd(0),
            maxContractExecutionEnergy: Energy.create(maxContractExecutionEnergy),
            address: ContractAddress.create(contractIndex, contractSubindex),
            receiveName: ReceiveName.create(
                ContractName.fromString(contractName),
                EntrypointName.fromString(entrypointName)
            ),
        };
        const type = AccountTransactionType.Update;
        const schemaVersion: SchemaVersion = SchemaVersion.V2;
        const parameters: SmartContractParameters = { obj: 'test' };
        const schema = 'VGhpcyBpcyBiYXNlNjQK';

        const handler = getAccountTransactionHandler(type);
        const accountTransactionPayload = {
            ...payload,
            message: Parameter.empty(),
        };
        const payloadJSON = handler.toJSON(accountTransactionPayload);

        let expected: SanitizedSendTransactionInput = {
            accountAddress: AccountAddress.fromBase58(accountAddress),
            type,
            payload: payloadJSON,
        };

        let result = sanitizeSendTransactionInput(accountAddress, type, payload);
        expect(result).toEqual(expected);

        expected = { ...expected, schemaVersion, parameters, schema: { type: 'module', value: schema } };

        result = sanitizeSendTransactionInput(
            AccountAddress.fromBase58(accountAddress),
            type,
            payload,
            parameters,
            schema,
            schemaVersion
        );
        expect(result).toEqual(expected);
    });

    test('Transforms "InitContract" transaction input as expected', () => {
        const type = AccountTransactionType.InitContract;
        const moduleRef = ModuleReference.fromHexString(
            '23513bcb5dbc81216fa4e12d3165a818e2b8699a1c9ef5c699f46ca3b1024ebf'
        );

        const expectedPayload: InitContractInput = {
            moduleRef,
            maxContractExecutionEnergy: Energy.create(maxContractExecutionEnergy),
            amount: CcdAmount.fromMicroCcd(amount),
            initName: ContractName.fromString(contractName),
            param: Parameter.empty(),
        };
        const handler = getAccountTransactionHandler(type);
        const expectedPayloadJSON = handler.toJSON(expectedPayload);

        const expected: SanitizedSendTransactionInput = {
            accountAddress: AccountAddress.fromBase58(accountAddress),
            type,
            payload: expectedPayloadJSON,
        };

        const v0: InitContractPayloadV0 = {
            amount: { microGtuAmount: amount },
            moduleRef,
            contractName,
            maxContractExecutionEnergy,
        };

        let result = sanitizeSendTransactionInput(accountAddress, type, v0);
        expect(result).toEqual(expected);

        const v1: InitContractPayloadV1 = {
            amount: { microCcdAmount: amount },
            moduleRef,
            contractName,
            maxContractExecutionEnergy,
        };

        result = sanitizeSendTransactionInput(accountAddress, type, v1);
        expect(result).toEqual(expected);

        const v2: InitContractPayloadV2 = {
            amount: { microCcdAmount: amount },
            initName: contractName,
            moduleRef,
            maxContractExecutionEnergy,
        };

        result = sanitizeSendTransactionInput(accountAddress, type, v2);
        expect(result).toEqual(expected);

        const v3: SendTransactionInitContractPayload = {
            amount: CcdAmount.fromMicroCcd(amount),
            initName: ContractName.fromString(contractName),
            moduleRef,
            maxContractExecutionEnergy: Energy.create(maxContractExecutionEnergy),
        };

        result = sanitizeSendTransactionInput(accountAddress, type, v3);
        expect(result).toEqual(expected);
    });

    test('Transforms "UpdateContract" transaction input as expected', () => {
        const type = AccountTransactionType.Update;
        const receiveName = `${contractName}.${entrypointName}`;

        const expectedPayload: UpdateContractInput = {
            maxContractExecutionEnergy: Energy.create(maxContractExecutionEnergy),
            amount: CcdAmount.fromMicroCcd(amount),
            address: ContractAddress.create(contractIndex, contractSubindex),
            receiveName: ReceiveName.create(
                ContractName.fromString(contractName),
                EntrypointName.fromString(entrypointName)
            ),
            message: Parameter.empty(),
        };
        const handler = getAccountTransactionHandler(type);
        const expectedPayloadJSON = handler.toJSON(expectedPayload);
        const expected: SanitizedSendTransactionInput = {
            accountAddress: AccountAddress.fromBase58(accountAddress),
            type,
            payload: expectedPayloadJSON,
        };

        const v0: UpdateContractPayloadV0 = {
            amount: { microGtuAmount: amount },
            receiveName,
            contractAddress: { index: contractIndex, subindex: contractSubindex },
            maxContractExecutionEnergy,
        };

        let result = sanitizeSendTransactionInput(accountAddress, type, v0);
        expect(result).toEqual(expected);

        const v1: UpdateContractPayloadV1 = {
            amount: { microCcdAmount: amount },
            receiveName,
            contractAddress: { index: contractIndex, subindex: contractSubindex },
            maxContractExecutionEnergy,
        };

        result = sanitizeSendTransactionInput(accountAddress, type, v1);
        expect(result).toEqual(expected);

        const v2: SendTransactionUpdateContractPayload = {
            amount: CcdAmount.fromMicroCcd(amount),
            receiveName: ReceiveName.create(
                ContractName.fromString(contractName),
                EntrypointName.fromString(entrypointName)
            ),
            address: ContractAddress.create(contractIndex, contractSubindex),
            maxContractExecutionEnergy: Energy.create(maxContractExecutionEnergy),
        };

        result = sanitizeSendTransactionInput(accountAddress, type, v2);
        expect(result).toEqual(expected);
    });

    test('Transforms "DeployModule" transaction input as expected', () => {
        const type = AccountTransactionType.DeployModule;
        const version = 0;
        const source = Buffer.from('Serialize!');

        const expectedPayload: DeployModulePayload = {
            version,
            source,
        };
        const handler = getAccountTransactionHandler(type);
        const expectedPayloadJSON = handler.toJSON(expectedPayload);
        const expected: SanitizedSendTransactionInput = {
            accountAddress: AccountAddress.fromBase58(accountAddress),
            type,
            payload: expectedPayloadJSON,
        };

        const v0: DeployModulePayloadV0 = {
            version,
            content: source,
        };

        let result = sanitizeSendTransactionInput(accountAddress, type, v0);
        expect(result).toEqual(expected);

        const v1: DeployModulePayload = {
            version,
            source,
        };

        result = sanitizeSendTransactionInput(accountAddress, type, v1);
        expect(result).toEqual(expected);
    });

    test('Transforms "Transfer" transaction input as expected', () => {
        const type = AccountTransactionType.Transfer;

        const expectedPayload: SimpleTransferPayload = {
            toAddress: AccountAddress.fromBase58(accountAddress),
            amount: CcdAmount.fromMicroCcd(amount),
        };
        const handler = getAccountTransactionHandler(type);
        const expectedPayloadJSON = handler.toJSON(expectedPayload);
        const expected: SanitizedSendTransactionInput = {
            accountAddress: AccountAddress.fromBase58(accountAddress),
            type,
            payload: expectedPayloadJSON,
        };

        const v0: SimpleTransferPayloadV0 = {
            toAddress: { ...AccountAddress.fromBase58(accountAddress) },
            amount: { microGtuAmount: amount },
        };

        let result = sanitizeSendTransactionInput(accountAddress, type, v0);
        expect(result).toEqual(expected);

        const v1: SimpleTransferPayloadV1 = {
            toAddress: { ...AccountAddress.fromBase58(accountAddress) },
            amount: { microCcdAmount: amount },
        };

        result = sanitizeSendTransactionInput(accountAddress, type, v1);
        expect(result).toEqual(expected);

        const v2: SimpleTransferPayload = {
            toAddress: AccountAddress.fromBase58(accountAddress),
            amount: CcdAmount.fromMicroCcd(amount),
        };

        result = sanitizeSendTransactionInput(accountAddress, type, v2);
        expect(result).toEqual(expected);
    });

    test('Transforms "TransferWithMemo" transaction input as expected', () => {
        const type = AccountTransactionType.TransferWithMemo;
        const memo = new DataBlob(Buffer.from('Some memo message'));

        const expectedPayload: SimpleTransferWithMemoPayload = {
            toAddress: AccountAddress.fromBase58(accountAddress),
            amount: CcdAmount.fromMicroCcd(amount),
            memo,
        };
        const handler = getAccountTransactionHandler(type);
        const expectedPayloadJSON = handler.toJSON(expectedPayload);
        const expected: SanitizedSendTransactionInput = {
            accountAddress: AccountAddress.fromBase58(accountAddress),
            type,
            payload: expectedPayloadJSON,
        };

        const v0: SimpleTransferWithMemoPayloadV0 = {
            toAddress: { ...AccountAddress.fromBase58(accountAddress) },
            amount: { microGtuAmount: amount },
            memo,
        };

        let result = sanitizeSendTransactionInput(accountAddress, type, v0);
        expect(result).toEqual(expected);

        const v1: SimpleTransferWithMemoPayloadV1 = {
            toAddress: { ...AccountAddress.fromBase58(accountAddress) },
            amount: { microCcdAmount: amount },
            memo,
        };

        result = sanitizeSendTransactionInput(accountAddress, type, v1);
        expect(result).toEqual(expected);

        const v2: SimpleTransferWithMemoPayload = {
            toAddress: AccountAddress.fromBase58(accountAddress),
            amount: CcdAmount.fromMicroCcd(amount),
            memo,
        };

        result = sanitizeSendTransactionInput(accountAddress, type, v2);
        expect(result).toEqual(expected);
    });

    test('Transforms "TransferWithMemo" transaction input with incorrect type as expected', () => {
        const type = AccountTransactionType.TransferWithMemo;
        const memo = new DataBlob(Buffer.from('Some memo message'));
        const address = AccountAddress.fromBase58(accountAddress);

        const expectedPayload: SimpleTransferWithMemoPayload = {
            toAddress: AccountAddress.fromBase58(accountAddress),
            amount: CcdAmount.fromMicroCcd(amount),
            memo,
        };
        const handler = getAccountTransactionHandler(type);
        const expectedPayloadJSON = handler.toJSON(expectedPayload);

        const expected: SanitizedSendTransactionInput = {
            accountAddress: AccountAddress.fromBase58(accountAddress),
            type,
            payload: expectedPayloadJSON,
        };

        const payload: SimpleTransferWithMemoPayload = {
            toAddress: {
                address: address.address,
                decodedAddress: address.decodedAddress,
                __type: 'ccd_account_address',
            },
            amount: {
                microCcdAmount: amount,
                __type: 'ccd_ccd_amount',
            },
            memo: {
                data: memo.data,
                __type: 'ccd_data_blob',
            },
        } as unknown as SimpleTransferWithMemoPayload;

        const result = sanitizeSendTransactionInput(accountAddress, type, payload);
        expect(result).toEqual(expected);
    });

    test('Transforms "ConfigureBaker" transaction input as expected', () => {
        const type = AccountTransactionType.ConfigureBaker;
        const keys: BakerKeysWithProofs = {
            proofSig: '01',
            proofElection: '02',
            proofAggregation: '03',
            electionVerifyKey: '04',
            signatureVerifyKey: '05',
            aggregationVerifyKey: '06',
        };
        const metadataUrl = 'http://metadata.url';
        const restakeEarnings = true;
        const openForDelegation: OpenStatus = OpenStatus.OpenForAll;
        const bakingRewardCommission = 10;
        const transactionFeeCommission = 20;
        const finalizationRewardCommission = 30;

        const expectedPayload: ConfigureBakerPayload = {
            keys,
            stake: CcdAmount.fromMicroCcd(amount),
            metadataUrl,
            restakeEarnings,
            openForDelegation,
            bakingRewardCommission,
            transactionFeeCommission,
            finalizationRewardCommission,
        };
        const handler = getAccountTransactionHandler(type);
        const expectedPayloadJSON = handler.toJSON(expectedPayload);

        const expected: SanitizedSendTransactionInput = {
            accountAddress: AccountAddress.fromBase58(accountAddress),
            type,
            payload: expectedPayloadJSON,
        };

        const v0: ConfigureBakerPayloadV0 = {
            keys,
            metadataUrl,
            restakeEarnings,
            openForDelegation,
            bakingRewardCommission,
            transactionFeeCommission,
            finalizationRewardCommission,
            stake: { microCcdAmount: amount },
        };

        let result = sanitizeSendTransactionInput(accountAddress, type, v0);
        expect(result).toEqual(expected);

        const v1: ConfigureBakerPayload = {
            keys,
            metadataUrl,
            restakeEarnings,
            openForDelegation,
            bakingRewardCommission,
            transactionFeeCommission,
            finalizationRewardCommission,
            stake: CcdAmount.fromMicroCcd(amount),
        };

        result = sanitizeSendTransactionInput(accountAddress, type, v1);
        expect(result).toEqual(expected);
    });

    test('Transforms "ConfigureDelegation" transaction input as expected', () => {
        const type = AccountTransactionType.ConfigureDelegation;
        const restakeEarnings = true;
        const delegationTarget: DelegationTargetBaker = { bakerId: 12n, delegateType: DelegationTargetType.Baker };

        const expectedPayload: ConfigureDelegationPayload = {
            stake: CcdAmount.fromMicroCcd(amount),
            restakeEarnings,
            delegationTarget,
        };
        const handler = getAccountTransactionHandler(type);
        const expectedPayloadJSON = handler.toJSON(expectedPayload);

        const expected: SanitizedSendTransactionInput = {
            accountAddress: AccountAddress.fromBase58(accountAddress),
            type,
            payload: expectedPayloadJSON,
        };

        const v0: ConfigureDelegationPayloadV0 = {
            restakeEarnings,
            stake: { microCcdAmount: amount },
            delegationTarget,
        };

        let result = sanitizeSendTransactionInput(accountAddress, type, v0);
        expect(result).toEqual(expected);

        const v1: ConfigureDelegationPayload = {
            restakeEarnings,
            stake: CcdAmount.fromMicroCcd(amount),
            delegationTarget,
        };

        result = sanitizeSendTransactionInput(accountAddress, type, v1);
        expect(result).toEqual(expected);
    });

    test('Transforms "RegisterData" transaction input as expected', () => {
        const type = AccountTransactionType.RegisterData;

        const payload: RegisterDataPayload = {
            data: new DataBlob(Buffer.from('This is data!')),
        };
        const handler = getAccountTransactionHandler(type);
        const expectedPayloadJSON = handler.toJSON(payload);

        const expected: SanitizedSendTransactionInput = {
            accountAddress: AccountAddress.fromBase58(accountAddress),
            type,
            payload: expectedPayloadJSON,
        };
        const result = sanitizeSendTransactionInput(accountAddress, type, payload);
        expect(result).toEqual(expected);
    });

    test('Transformed "RegisterData" transaction input with "DataBlob"-like parameter can be parsed', () => {
        const type = AccountTransactionType.RegisterData;

        const payload: RegisterDataPayload = {
            data: {
                __type: 'ccd_data_blob',
                data: new DataBlob(Buffer.from('This is data!')).data,
            } as unknown as DataBlob,
        };

        const expectedPayload: RegisterDataPayload = {
            data: new DataBlob(Buffer.from('This is data!')),
        };
        const handler = getAccountTransactionHandler(type);
        const expectedPayloadJSON = handler.toJSON(expectedPayload);

        const expected: SanitizedSendTransactionInput = {
            accountAddress: AccountAddress.fromBase58(accountAddress),
            type,
            payload: expectedPayloadJSON,
        };

        const result = sanitizeSendTransactionInput(accountAddress, type, payload);
        expect(result).toEqual(expected);
    });

    test('Transforms "UpdateCredentials" transaction input as expected', () => {
        const type = AccountTransactionType.UpdateCredentials;

        // commitments value was removed in type UpdateCredentialsInput
        const payload: UpdateCredentialsInput = {
            newCredentials: [
                {
                    index: 1,
                    cdi: {
                        credId: '010203',
                        policy: {
                            validTo: new Date().toString(),
                            createdAt: new Date(0).toString(),
                            revealedAttributes: { dob: 'dob' } as Record<AttributeKey, string>,
                        },
                        proofs: '01030204',
                        ipIdentity: 1,
                        revocationThreshold: 2,
                        credentialPublicKeys: {
                            threshold: 1,
                            keys: { 0: { schemeId: 'ed25519', verifyKey: '030201' } },
                        },
                        arData: { arData: { encIdCredPubShare: 'encIdCredPubShare' } },
                    },
                },
            ],
            threshold: 1,
            removeCredentialIds: ['010302'],
            currentNumberOfCredentials: 1n,
        };
        const handler = getAccountTransactionHandler(type);
        const expectedPayloadJSON = handler.toJSON(payload);

        const expected: SanitizedSendTransactionInput = {
            accountAddress: AccountAddress.fromBase58(accountAddress),
            type,
            payload: expectedPayloadJSON,
        };
        const result = sanitizeSendTransactionInput(accountAddress, type, payload);
        expect(result).toEqual(expected);
        expect(result.payload).toBe(payload);
    });
});
