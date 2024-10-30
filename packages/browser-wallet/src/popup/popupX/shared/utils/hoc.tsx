import React, { useState } from 'react';
import { useSelectedCredential } from '@popup/shared/utils/account-helpers';
import Loader from '@popup/popupX/shared/Loader';
import PasswordProtect, { PasswordProtectConfigType } from '@popup/popupX/shared/PasswordProtect';

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

export function withPasswordProtected(Component: React.ComponentType, config: PasswordProtectConfigType) {
    function NewComponent() {
        const [passwordConfirmed, setPasswordConfirmed] = useState(false);

        if (!passwordConfirmed) {
            return <PasswordProtect setPasswordConfirmed={setPasswordConfirmed} config={config} />;
        }

        return <Component />;
    }
    return NewComponent;
}
