import React from 'react';
import { useSelectedCredential } from '@popup/shared/utils/account-helpers';
import Loader from '@popup/popupX/shared/Loader';

export function withSelectedCredential<P extends object>(
    Component: React.ComponentType<P>
): React.FC<Pick<P, Exclude<keyof P, 'credential'>>> {
    function NewComponent(props: Pick<P, Exclude<keyof P, 'credential'>>) {
        const credential = useSelectedCredential();

        if (credential) {
            return <Component {...(props as P)} credential={credential} />;
        }

        return <Loader />;
    }
    return NewComponent;
}
