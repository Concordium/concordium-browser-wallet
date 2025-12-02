import React, { useState } from 'react';
import { useAtomValue } from 'jotai';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelectedCredential } from '@popup/shared/utils/account-helpers';
import Loader from '@popup/popupX/shared/Loader';
import PasswordProtect, { PasswordProtectConfigType } from '@popup/popupX/shared/PasswordProtect';
import PasswordSession from '@popup/popupX/shared/PasswordSession';
import { hasBeenOnBoardedAtom, sessionOnboardingLocationAtom, sessionPasscodeAtom } from '@popup/store/settings';
import { isRecoveringAtom } from '@popup/store/identity';
import { absoluteRoutes } from '@popup/popupX/constants/routes';

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

export function withPasswordSession(Component: React.ComponentType) {
    function NewComponent() {
        const { value: sessionPasscode } = useAtomValue(sessionPasscodeAtom);

        if (!sessionPasscode) {
            return <PasswordSession />;
        }

        return <Component />;
    }
    return NewComponent;
}

export function withRedirect(Component: React.ComponentType) {
    function NewComponent() {
        const { pathname } = useLocation();
        const { loading: loadingIsRecovering, value: sessionIsRecovering } = useAtomValue(isRecoveringAtom);
        const isAtRecovery = pathname === absoluteRoutes.settings.restore.main.path;

        const { loading: loadingHasBeenOnboarded, value: hasBeenOnboarded } = useAtomValue(hasBeenOnBoardedAtom);
        const isAtOnboarding = pathname.includes('onboarding');

        const { loading: loadingSessionOnboardingLocation, value: sessionOnboardingLocation } =
            useAtomValue(sessionOnboardingLocationAtom);

        if (loadingHasBeenOnboarded || loadingIsRecovering || loadingSessionOnboardingLocation) {
            return null;
        }

        if (sessionIsRecovering && !isAtRecovery) {
            return <Navigate to={absoluteRoutes.settings.restore.main.path} />;
        }

        if (!hasBeenOnboarded && sessionOnboardingLocation) {
            return <Navigate to={sessionOnboardingLocation} />;
        }

        if (!hasBeenOnboarded && !isAtOnboarding) {
            return <Navigate to={absoluteRoutes.onboarding.path} />;
        }

        return <Component />;
    }
    return NewComponent;
}
