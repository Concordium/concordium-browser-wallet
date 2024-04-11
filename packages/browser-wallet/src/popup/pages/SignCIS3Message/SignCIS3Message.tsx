import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import clsx from 'clsx';
import { stringify } from 'json-bigint';
import { useTranslation } from 'react-i18next';
import { useAtomValue, useSetAtom } from 'jotai';
import { Buffer } from 'buffer/';
import {
    AccountAddress,
    AccountTransactionSignature,
    buildBasicAccountSigner,
    ConcordiumGRPCClient,
    ContractAddress,
    ContractName,
    deserializeTypeValue,
    EntrypointName,
    getUpdateContractParameterSchema,
    ModuleReference,
    signMessage,
} from '@concordium/web-sdk';
import { fullscreenPromptContext } from '@popup/page-layouts/FullscreenPromptLayout';
import { usePrivateKey } from '@popup/shared/utils/account-helpers';
import { displayUrl } from '@popup/shared/utils/string-helpers';
import { TextArea } from '@popup/shared/Form/TextArea';
import ConnectedBox from '@popup/pages/Account/ConnectedBox';
import Button from '@popup/shared/Button';
import { addToastAtom } from '@popup/state';
import ExternalRequestLayout from '@popup/page-layouts/ExternalRequestLayout';
import { grpcClientAtom } from '@popup/store/settings';
import { SignMessageObject } from '@concordium/browser-wallet-api-helpers';

type Props = {
    onSubmit(signature: AccountTransactionSignature): void;
    onReject(): void;
};

interface Location {
    state: {
        payload: {
            accountAddress: string;
            message: SignMessageObject;
            url: string;
            cis3ContractDetails: Cis3ContractDetailsObject;
        };
    };
}

type Cis3ContractDetailsObject = {
    contractAddress: ContractAddress.Type;
    contractName: ContractName.Type;
    entrypointName: EntrypointName.Type;
};

type DeserializedMessageObject = {
    payload: bigint[] | [];
};

async function parseMessage(
    message: SignMessageObject,
    client: ConcordiumGRPCClient,
    cis3ContractDetails: Cis3ContractDetailsObject
) {
    const deserializedMessage = deserializeTypeValue(
        Buffer.from(message.data, 'hex'),
        Buffer.from(message.schema, 'base64')
    ) as DeserializedMessageObject;

    const { contractAddress, contractName, entrypointName } = cis3ContractDetails;
    const instanceInfo = await client.getInstanceInfo(contractAddress);

    const schema = await client.getEmbeddedSchema(ModuleReference.fromHexString(instanceInfo.sourceModule.moduleRef));

    const updateContractParameterSchema = getUpdateContractParameterSchema(
        schema,
        contractName,
        entrypointName,
        instanceInfo.version
    );

    return stringify(
        deserializeTypeValue(
            BigInt64Array.from(deserializedMessage.payload).buffer,
            updateContractParameterSchema.buffer
        ),
        undefined,
        2
    );
}

function MessageDetailsDisplay({
    message,
    cis3ContractDetails,
}: {
    message: SignMessageObject;
    cis3ContractDetails: Cis3ContractDetailsObject;
}) {
    const { t } = useTranslation('signCIS3Message');
    const client = useAtomValue(grpcClientAtom);
    const { contractAddress, contractName, entrypointName } = cis3ContractDetails;
    const [parsedMessage, setParsedMessage] = useState<string>('');

    useEffect(() => {
        try {
            parseMessage(message, client, cis3ContractDetails).then((m) => setParsedMessage(m));
        } catch (e) {
            setParsedMessage(t('unableToDeserialize'));
        }
    }, []);

    return (
        <div className="m-10 sign-cis3-message__details">
            <h5>{t('contractIndex')}:</h5>
            <div>
                {contractAddress.index.toString()} ({contractAddress.subindex.toString()})
            </div>
            <h5>{t('receiveName')}:</h5>
            <div>
                {contractName.value.toString()}.{entrypointName.value.toString()}
            </div>
            <h5>{t('parameter')}:</h5>
            <TextArea
                readOnly
                className={clsx('m-b-10 w-full flex-child-fill sign-cis3-message__details-text-area')}
                value={parsedMessage}
            />
        </div>
    );
}

export default function SignCIS3Message({ onSubmit, onReject }: Props) {
    const { state } = useLocation() as Location;
    const { t } = useTranslation('signCIS3Message');
    const { withClose } = useContext(fullscreenPromptContext);
    const { accountAddress, url, message, cis3ContractDetails } = state.payload;
    const key = usePrivateKey(accountAddress);
    const addToast = useSetAtom(addToastAtom);

    const onClick = useCallback(async () => {
        if (!key) {
            throw new Error('Missing key for the chosen address');
        }

        return signMessage(
            AccountAddress.fromBase58(accountAddress),
            Buffer.from(message.data, 'hex'),
            buildBasicAccountSigner(key)
        );
    }, [state.payload.message, state.payload.accountAddress, key]);

    return (
        <ExternalRequestLayout className="p-10">
            <ConnectedBox accountAddress={accountAddress} url={new URL(url).origin} />
            <div className="h-full flex-column align-center">
                <h3 className="m-t-0 text-center">{t('description', { dApp: displayUrl(url) })}</h3>
                <p className="m-t-0 text-center">{t('descriptionWithSchema', { dApp: displayUrl(url) })}</p>
                <MessageDetailsDisplay message={message} cis3ContractDetails={cis3ContractDetails} />
                <br />
                <div className="flex p-b-10 p-t-10  m-t-auto">
                    <Button width="narrow" className="m-r-10" onClick={withClose(onReject)}>
                        {t('reject')}
                    </Button>
                    <Button
                        width="narrow"
                        onClick={() =>
                            onClick()
                                .then(withClose(onSubmit))
                                .catch((e) => addToast(e.message))
                        }
                    >
                        {t('sign')}
                    </Button>
                </div>
            </div>
        </ExternalRequestLayout>
    );
}
