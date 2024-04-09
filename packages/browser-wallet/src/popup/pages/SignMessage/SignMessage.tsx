import React, { useContext, useCallback, useState, useMemo, useEffect } from 'react';
import { Buffer } from 'buffer/';
import { fullscreenPromptContext } from '@popup/page-layouts/FullscreenPromptLayout';
import { useTranslation } from 'react-i18next';
import { useAtomValue, useSetAtom } from 'jotai';
import { useLocation } from 'react-router-dom';
import {
    signMessage,
    buildBasicAccountSigner,
    AccountTransactionSignature,
    AccountAddress,
    deserializeTypeValue,
    ContractAddress,
    ModuleReference,
    getUpdateContractParameterSchema,
    ContractName,
    EntrypointName,
    ConcordiumGRPCClient,
} from '@concordium/web-sdk';
import { usePrivateKey } from '@popup/shared/utils/account-helpers';
import { displayUrl } from '@popup/shared/utils/string-helpers';
import { TextArea } from '@popup/shared/Form/TextArea';
import ConnectedBox from '@popup/pages/Account/ConnectedBox';
import Button from '@popup/shared/Button';
import { addToastAtom } from '@popup/state';
import ExternalRequestLayout from '@popup/page-layouts/ExternalRequestLayout';
import TabBar from '@popup/shared/TabBar';
import clsx from 'clsx';
import { stringify } from 'json-bigint';
import { grpcClientAtom } from '@popup/store/settings';

type Props = {
    onSubmit(signature: AccountTransactionSignature): void;
    onReject(): void;
};

interface Location {
    state: {
        payload: {
            accountAddress: string;
            message: string | MessageObject;
            url: string;
            cis3ContractDetails: Cis3ContractDetailsObject | undefined;
        };
    };
}

type MessageObject = {
    schema: string;
    data: string;
};

type Cis3ContractDetailsObject = {
    contractAddress: ContractAddress.Type;
    contractName: ContractName.Type;
    entrypointName: EntrypointName.Type;
};

type DeserializedMessageObject = {
    payload: bigint[] | [];
};

async function parseMessage(
    message: MessageObject,
    client: ConcordiumGRPCClient,
    cis3ContractDetails: Cis3ContractDetailsObject | undefined,
    setParsedMessage: React.Dispatch<React.SetStateAction<string>>
) {
    const deserializedMessage = deserializeTypeValue(
        Buffer.from(message.data, 'hex'),
        Buffer.from(message.schema, 'base64')
    ) as DeserializedMessageObject;

    if (cis3ContractDetails) {
        const { contractAddress, contractName, entrypointName } = cis3ContractDetails;
        const instanceInfo = await client.getInstanceInfo(contractAddress);

        const schema = await client.getEmbeddedSchema(
            ModuleReference.fromHexString(instanceInfo.sourceModule.moduleRef)
        );

        const updateContractParameterSchema = getUpdateContractParameterSchema(
            schema,
            contractName,
            entrypointName,
            instanceInfo.version
        );

        deserializedMessage.payload = deserializeTypeValue(
            BigInt64Array.from(deserializedMessage.payload).buffer,
            updateContractParameterSchema.buffer
        ) as [];
    }
    setParsedMessage(stringify(deserializedMessage, undefined, 2));
}

function BinaryDisplay({
    message,
    url,
    cis3ContractDetails,
}: {
    message: MessageObject;
    url: string;
    cis3ContractDetails: Cis3ContractDetailsObject | undefined;
}) {
    const { t } = useTranslation('signMessage');
    const client = useAtomValue(grpcClientAtom);
    const [displayDeserialized, setDisplayDeserialized] = useState<boolean>(true);
    const [parsedMessage, setParsedMessage] = useState<string>('');

    useEffect(() => {
        try {
            parseMessage(message, client, cis3ContractDetails, setParsedMessage);
        } catch (e) {
            setParsedMessage(t('unableToDeserialize'));
        }
    }, []);

    const display = useMemo(
        () => (displayDeserialized ? parsedMessage : message.data),
        [displayDeserialized, parsedMessage]
    );

    return (
        <>
            <p className="m-t-0 text-center">{t('descriptionWithSchema', { dApp: displayUrl(url) })}</p>
            <TabBar className="sign-message__view-actions">
                <TabBar.Item
                    className={clsx('sign-message__link', displayDeserialized && 'active')}
                    as={Button}
                    clear
                    onClick={() => setDisplayDeserialized(true)}
                >
                    {t('deserializedDisplay')}
                </TabBar.Item>
                <TabBar.Item
                    className={clsx('sign-message__link', !displayDeserialized && 'active')}
                    as={Button}
                    clear
                    onClick={() => setDisplayDeserialized(false)}
                >
                    {t('rawDisplay')}
                </TabBar.Item>
            </TabBar>
            <TextArea
                readOnly
                className={clsx('m-b-20 w-full flex-child-fill sign-message__binary-text-area')}
                value={display}
            />
        </>
    );
}

export default function SignMessage({ onSubmit, onReject }: Props) {
    const { state } = useLocation() as Location;
    const { t } = useTranslation('signMessage');
    const { withClose } = useContext(fullscreenPromptContext);
    const { accountAddress, url } = state.payload;
    const key = usePrivateKey(accountAddress);
    const addToast = useSetAtom(addToastAtom);
    const { message, cis3ContractDetails } = state.payload;
    const messageIsAString = typeof message === 'string';

    const onClick = useCallback(async () => {
        if (!key) {
            throw new Error('Missing key for the chosen address');
        }

        return signMessage(
            AccountAddress.fromBase58(accountAddress),
            messageIsAString ? message : Buffer.from(message.data, 'hex'),
            buildBasicAccountSigner(key)
        );
    }, [state.payload.message, state.payload.accountAddress, key]);

    return (
        <ExternalRequestLayout className="p-10">
            <ConnectedBox accountAddress={accountAddress} url={new URL(url).origin} />
            <div className="h-full flex-column align-center">
                <h3 className="m-t-0 text-center">{t('description', { dApp: displayUrl(url) })}</h3>
                {messageIsAString && <TextArea readOnly className="m-v-20 w-full flex-child-fill" value={message} />}
                {!messageIsAString && (
                    <BinaryDisplay message={message} url={url} cis3ContractDetails={cis3ContractDetails} />
                )}
                <div className="flex p-b-10  m-t-auto">
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
