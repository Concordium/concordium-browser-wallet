import React, { useMemo, useState } from 'react';
import Text from '@popup/popupX/shared/Text';
import { Trans, useTranslation } from 'react-i18next';
import { TextArea } from '@popup/popupX/shared/Form/TextArea';
import { stringify } from 'json-bigint';
import { deserializeTypeValue } from '@concordium/web-sdk';
import { Buffer } from 'buffer';
import { displayUrl } from '@popup/shared/utils/string-helpers';
import TabBar from '@popup/popupX/shared/TabBar';
import clsx from 'clsx';
import Button from '@popup/popupX/shared/Button';

type MessageObject = {
    schema: string;
    data: string;
};

function StringRender({ message }: { message: string }) {
    return (
        <div className="binary-display-x">
            <TextArea readOnly value={message} />
        </div>
    );
}

function BinaryRender({ message, url }: { message: MessageObject; url: string }) {
    const { t } = useTranslation('x', { keyPrefix: 'sharedX.binaryDisplay' });
    const [displayDeserialized, setDisplayDeserialized] = useState<boolean>(true);

    const parsedMessage = useMemo(() => {
        try {
            return stringify(
                deserializeTypeValue(Buffer.from(message.data, 'hex'), Buffer.from(message.schema, 'base64')),
                undefined,
                2
            );
        } catch (e) {
            return t('unableToDeserialize');
        }
    }, []);

    const display = useMemo(() => (displayDeserialized ? parsedMessage : message.data), [displayDeserialized]);

    return (
        <div className="binary-display-x">
            <Text.Capture>
                <Trans
                    ns="x"
                    i18nKey="prompts.signCis3.connectionDetails"
                    components={{ 1: <span className="white" /> }}
                    values={{ dApp: displayUrl(url) }}
                />
            </Text.Capture>
            <TabBar className="sign-message__view-actions">
                <TabBar.Item
                    className={clsx('sign-message__link', displayDeserialized && 'active')}
                    as={Button.Base}
                    onClick={() => setDisplayDeserialized(true)}
                >
                    {t('deserializedDisplay')}
                </TabBar.Item>
                <TabBar.Item
                    className={clsx('sign-message__link', !displayDeserialized && 'active')}
                    as={Button.Base}
                    onClick={() => setDisplayDeserialized(false)}
                >
                    {t('rawDisplay')}
                </TabBar.Item>
            </TabBar>
            <TextArea readOnly className={clsx('sign-message__binary-text-area')} value={display} />
        </div>
    );
}

export default function BinaryDisplay({ message, url }: { message: MessageObject | string; url: string }) {
    const messageIsAString = typeof message === 'string';

    if (messageIsAString) {
        return <StringRender message={message} />;
    }

    return <BinaryRender message={message} url={url} />;
}
