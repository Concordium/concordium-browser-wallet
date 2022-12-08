import Button from '@popup/shared/Button';
import ExternalLink from '@popup/shared/ExternalLink';
import { selectedAccountAtom } from '@popup/store/account';
import { networkConfigurationAtom } from '@popup/store/settings';
import urls from '@shared/constants/url';
import { isMainnet } from '@shared/utils/network-helpers';
import { useAtomValue } from 'jotai';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

const SELECT_ACCOUNT_PATH = 'accounts?dcount=1&dentity=account&daddress=';

export default function AccountStatement() {
    const { t } = useTranslation('account', { keyPrefix: 'settings.accountStatement' });
    const network = useAtomValue(networkConfigurationAtom);
    const account = useAtomValue(selectedAccountAtom);
    const url = useMemo(
        () => `${isMainnet(network) ? urls.ccdscanMainnet : urls.ccdscanTestnet}${SELECT_ACCOUNT_PATH}${account}`,
        [network, account]
    );

    return (
        <div className="flex-column align-center white-space-break justify-space-between m-10 text-center">
            <div>{t('description')}</div>
            <Button width="wide" as={ExternalLink} path={url}>
                {t('link')}
            </Button>
        </div>
    );
}
