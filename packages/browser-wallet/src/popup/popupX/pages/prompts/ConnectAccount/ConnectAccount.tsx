import React, { ChangeEvent, useContext, useEffect, useMemo, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useAtom, useAtomValue } from 'jotai';
import Page from '@popup/popupX/shared/Page';
import Text from '@popup/popupX/shared/Text';
import { useUrlDisplay } from '@popup/popupX/shared/utils/helpers';
import Button from '@popup/popupX/shared/Button';
import { fullscreenPromptContext } from '@popup/popupX/page-layouts/FullscreenPromptLayout';
import Card from '@popup/popupX/shared/Card';
import { Checkbox } from '@popup/popupX/shared/Form/Checkbox';
import { Search } from '@popup/popupX/shared/Form/Search';
import ArrowsUpDown from '@assets/svgX/arrows-down-up.svg';
import { credentialsAtomWithLoading, storedAllowlistAtom } from '@popup/store/account';
import { WalletCredential } from '@shared/storage/types';
import { displaySplitAddressShort, useIdentityName } from '@popup/shared/utils/account-helpers';
import { handleAllowlistEntryUpdate } from '@popup/pages/Allowlist/util';

function compareAsc(left: WalletCredential, right: WalletCredential): number {
    if (left.credName === '' && right.credName !== '') {
        return 1;
    }
    if (right.credName === '' && left.credName !== '') {
        return -1;
    }
    return left.credName.localeCompare(right.credName) || left.address.localeCompare(right.address);
}

function compareDesc(left: WalletCredential, right: WalletCredential): number {
    return compareAsc(right, left);
}

function SearchGroup({
    search,
    setSearch,
    ascSort,
    setAscSort,
}: {
    search: string;
    setSearch(value: React.SetStateAction<string>): void;
    ascSort: boolean;
    setAscSort(value: React.SetStateAction<boolean>): void;
}) {
    const { t } = useTranslation('x', { keyPrefix: 'prompts.connectAccount' });

    return (
        <div className="search-group">
            <Search
                autoFocus
                placeholder={t('searchBy')}
                value={search}
                onChange={(e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            />
            <Button.IconText
                icon={<ArrowsUpDown />}
                label={ascSort ? t('sortAsc') : t('sortDesc')}
                onClick={() => setAscSort((a) => !a)}
            />
        </div>
    );
}

function AccountRow({
    credential,
    addRemoveAccount,
}: {
    credential: WalletCredential;
    addRemoveAccount(checked: boolean, accountAddress: string): void;
}) {
    const { credName, address } = credential;
    const identityName = useIdentityName(credential);

    return (
        <Card.Row>
            <Checkbox
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    addRemoveAccount(e.target.checked, address);
                }}
            />
            <Text.AdditionalSmall>{credName}</Text.AdditionalSmall>
            <Text.AdditionalSmall className="split"> / </Text.AdditionalSmall>
            <Text.AdditionalSmall>{displaySplitAddressShort(address)}</Text.AdditionalSmall>
            <Text.AdditionalSmall>{identityName}</Text.AdditionalSmall>
        </Card.Row>
    );
}

type Props = {
    onAllow(accountAdresses: string[]): void;
    onReject(): void;
};

export default function ConnectAccount({ onAllow, onReject }: Props) {
    const { t } = useTranslation('x', { keyPrefix: 'prompts.connectAccount' });
    const [search, setSearch] = useState('');
    const [ascSort, setAscSort] = useState(true);
    const [connectButtonDisabled, setConnectButtonDisabled] = useState<boolean>(false);
    const [accountsToAdd, setAccountsToAdd] = useState<string[]>([]);
    const [urlDisplay, url] = useUrlDisplay();
    const { onClose, withClose } = useContext(fullscreenPromptContext);
    const credentialsLoading = useAtomValue(credentialsAtomWithLoading);
    const [allowListLoading, setAllowList] = useAtom(storedAllowlistAtom);
    const credentials = credentialsLoading.value ?? [];
    const filtered = useMemo(
        () =>
            credentials.filter(
                (credential) =>
                    credential.credName?.toLowerCase().includes(search.toLowerCase()) ||
                    credential.address?.toLowerCase().includes(search.toLowerCase())
            ),
        [search, credentials]
    );
    const sorted = useMemo(() => filtered.sort(ascSort ? compareAsc : compareDesc), [filtered, ascSort]);

    useEffect(() => onClose(onReject), [onClose, onReject]);

    const addRemoveAccount = (checked: boolean, accountAddress: string) => {
        if (checked) {
            setAccountsToAdd([...accountsToAdd, accountAddress]);
        } else {
            setAccountsToAdd(accountsToAdd.filter((a) => a === accountAddress));
        }
    };

    return (
        <Page className="connect-account-x">
            <Page.Top heading={t('connectAccount')} />
            <Page.Main>
                <Text.Main>
                    <Trans
                        ns="x"
                        i18nKey="prompts.connectAccount.connectTo"
                        components={{ 1: <span className="white" /> }}
                        values={{ dApp: urlDisplay }}
                    />
                </Text.Main>
                <Text.Capture>{t('connectionDetails')}</Text.Capture>
                <Card>
                    {credentials.length > 4 && <SearchGroup {...{ search, setSearch, ascSort, setAscSort }} />}
                    <div className="scroll-section">
                        {sorted.map((credential) => (
                            <AccountRow
                                key={credential.credId}
                                credential={credential}
                                addRemoveAccount={addRemoveAccount}
                            />
                        ))}
                    </div>
                </Card>
            </Page.Main>
            <Page.Footer>
                <Button.Main className="secondary" label={t('cancel')} onClick={withClose(onReject)} />
                <Button.Main
                    label={t('connect')}
                    disabled={connectButtonDisabled}
                    onClick={() => {
                        setConnectButtonDisabled(true);
                        handleAllowlistEntryUpdate(
                            new URL(url).origin,
                            allowListLoading.value,
                            accountsToAdd,
                            setAllowList
                        ).then(
                            withClose(() => {
                                onAllow(accountsToAdd);
                            })
                        );
                    }}
                />
            </Page.Footer>
        </Page>
    );
}
