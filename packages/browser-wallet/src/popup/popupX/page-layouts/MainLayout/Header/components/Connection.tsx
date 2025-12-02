import React, { useEffect, useState } from 'react';
import Globe from '@assets/svgX/UiKit/Interface/globe-world.svg';
import Indicator from '@assets/svgX/UiKit/Custom/indicator-horisontal-s.svg';
import { useAtomValue } from 'jotai';
import { storedAllowlistAtom } from '@popup/store/account';
import { useCurrentOpenTabUrl } from '@popup/shared/utils/tabs';
import { useSelectedCredential } from '@popup/shared/utils/account-helpers';
import clsx from 'clsx';
import { Location, useLocation } from 'react-router-dom';
import { relativeRoutes } from '@popup/popupX/constants/routes';

type Props = {
    hideConnection?: boolean;
};

interface ConnectionLocation extends Location {
    state: {
        payload: {
            url: string;
        };
    };
}

export default function Connection({ hideConnection }: Props) {
    const [isAccountConnectedToSite, setAccountConnectedToSite] = useState<boolean>();
    const allowlist = useAtomValue(storedAllowlistAtom);
    const { pathname, state } = useLocation() as ConnectionLocation;
    const currentOpenTabUrl = useCurrentOpenTabUrl();
    const url = state?.payload?.url ? new URL(state.payload.url).origin : currentOpenTabUrl;
    const selectedCred = useSelectedCredential();
    const accountAddress = selectedCred?.address;
    const waitingForConnection = pathname.includes(relativeRoutes.prompt.connectionRequest.path);

    useEffect(() => {
        if (accountAddress && !allowlist.loading && url) {
            const allowlistForUrl = allowlist.value[url];
            setAccountConnectedToSite(allowlistForUrl?.includes(accountAddress) ?? false);
        }
    }, [accountAddress, allowlist, url]);

    return (
        <div className={clsx('main-header__connection', { hidden: hideConnection })}>
            <div className="main-header__connection_info">
                <Globe />
                <span
                    className={clsx('connection_status', {
                        connected: !waitingForConnection && isAccountConnectedToSite,
                        waiting: waitingForConnection,
                    })}
                >
                    <Indicator />
                </span>
            </div>
        </div>
    );
}
