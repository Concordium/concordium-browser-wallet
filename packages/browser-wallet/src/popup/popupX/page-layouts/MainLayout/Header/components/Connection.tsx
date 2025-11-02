import React, { useEffect, useState } from 'react';
// import Info from '@assets/svgX/info.svg';
// import Dot from '@assets/svgX/dot.svg';
import GlobeOn from '@assets/svgX/globe-on.svg';
import GlobeOff from '@assets/svgX/globe-off.svg';
import { useAtomValue } from 'jotai';
import { storedAllowlistAtom } from '@popup/store/account';
import { useCurrentOpenTabUrl } from '@popup/shared/utils/tabs';
import { useSelectedCredential } from '@popup/shared/utils/account-helpers';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { Location, useLocation } from 'react-router-dom';
import { relativeRoutes } from '@popup/popupX/constants/routes';
// import Text from '@popup/popupX/shared/Text';
// import Tooltip from '@popup/popupX/shared/Tooltip';

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
    const { t } = useTranslation('x', { keyPrefix: 'header.connection' });
    const [isAccountConnectedToSite, setAccountConnectedToSite] = useState<boolean>();
    const allowlist = useAtomValue(storedAllowlistAtom);
    const { pathname, state } = useLocation() as ConnectionLocation;
    const currentOpenTabUrl = useCurrentOpenTabUrl();
    const url = state?.payload?.url ? new URL(state.payload.url).origin : currentOpenTabUrl;
    const selectedCred = useSelectedCredential();
    const accountAddress = selectedCred?.address;
    const hostname = url ? new URL(url).hostname : '';
    const waitingForConnection = pathname.includes(relativeRoutes.prompt.connectionRequest.path);
    const connectionText =
        (waitingForConnection && t('waiting')) || (isAccountConnectedToSite && hostname) || t('siteNotConnected');

    useEffect(() => {
        if (accountAddress && !allowlist.loading && url) {
            const allowlistForUrl = allowlist.value[url];
            setAccountConnectedToSite(allowlistForUrl?.includes(accountAddress) ?? false);
        }
    }, [accountAddress, allowlist, url]);

    if (hideConnection) return null;
    return (
        <div>
            <span
                className={clsx('connection_status', {
                    connected: !waitingForConnection && isAccountConnectedToSite,
                    waiting: waitingForConnection,
                })}
            >
                <span title={connectionText} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    {isAccountConnectedToSite ? <GlobeOn /> : <GlobeOff />}
                </span>
                {/* <Dot />
                <Text.Capture>{connectionText}</Text.Capture> */}
            </span>
            {/* <Tooltip position="top" title={t('tooltip.title')} text={t('tooltip.text')} className="info-icon">
                    <Info />
                </Tooltip> */}
        </div>
    );
}
