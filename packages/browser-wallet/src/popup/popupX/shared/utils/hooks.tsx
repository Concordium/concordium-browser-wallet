import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSetAtom } from 'jotai';
import { addToastAtom } from '@popup/state';
import { copyToClipboard } from '@popup/popupX/shared/utils/helpers';
import { CopyAddress, GenericMessage } from '@popup/popupX/shared/Toast/Messages';

export function useCopyAddress() {
    const { t } = useTranslation('x', { keyPrefix: 'sharedX.messages' });
    const addToast = useSetAtom(addToastAtom);

    return (address: string) => {
        copyToClipboard(address).then(() => addToast(<CopyAddress address={address} message={t('addressCopied')} />));
    };
}

export function useCopyToClipboard() {
    const { t } = useTranslation('x', { keyPrefix: 'sharedX.messages' });
    const addToast = useSetAtom(addToastAtom);

    return (text: string) => {
        copyToClipboard(text).then(() => addToast(<GenericMessage title={t('copied')} />));
    };
}

export function useGenericToast() {
    const addToast = useSetAtom(addToastAtom);
    return (title: string, message?: string) => {
        addToast(<GenericMessage title={title} message={message} />);
    };
}
