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
        <div className="account-statement-page">
            <div>
                <h3 className="m-t-0">{t('title')}</h3>
                <div>{t('description')}</div>
            </div>
            <Button width="wide" as={ExternalLink} path={url}>
                {t('link')}
            </Button>
        </div>
    );
}
