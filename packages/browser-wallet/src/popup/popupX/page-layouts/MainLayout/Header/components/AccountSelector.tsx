import React, { ChangeEvent, useMemo, useState } from 'react';
import CarretRight from '@assets/svgX/caret-right.svg';
import ArrowsUpDown from '@assets/svgX/arrows-down-up.svg';
import Percent from '@assets/svgX/percent.svg';
import Copy from '@assets/svgX/copy.svg';
import ConcordiumLogo from '@assets/svgX/concordium-logo.svg';
import { Search } from '@popup/popupX/shared/Form/Search';
import Button from '@popup/popupX/shared/Button';
import { useAtom, useAtomValue } from 'jotai';
import { credentialsAtomWithLoading, selectedAccountAtom } from '@popup/store/account';
import { displayNameOrSplitAddress } from '@popup/shared/utils/account-helpers';
import { useAccountInfo } from '@popup/shared/AccountInfoListenerContext';
import { getPublicAccountAmounts, microCcdToCcd } from 'wallet-common-helpers';
import { WalletCredential } from '@shared/storage/types';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import Text from '@popup/popupX/shared/Text';
import { AccountInfoType } from '@concordium/web-sdk';
import { useCopyAddress } from '@popup/popupX/shared/utils/hooks';

function shortNumber(number: number | string): string {
    return number.toLocaleString('en-US', {
        maximumFractionDigits: 1,
        notation: 'compact',
        compactDisplay: 'short',
    });
}

function CcdBalance({ credential }: { credential: WalletCredential }) {
    const accountInfo = useAccountInfo(credential);
    const { total, staked } = getPublicAccountAmounts(accountInfo);
    const accountTotal = Number(microCcdToCcd(total));
    const accountStaked = Number(microCcdToCcd(staked));

    return (
        <>
            {shortNumber(accountTotal)}
            <ConcordiumLogo />
            {!!accountStaked && (
                <>
                    {` \u00B7 `} {shortNumber(accountStaked)} <ConcordiumLogo />
                </>
            )}
        </>
    );
}

type Props = { showAccountSelector: boolean; onUpdateSelectedAccount: () => void };

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

function Earning({ credential }: { credential: WalletCredential }) {
    const accountInfo = useAccountInfo(credential);
    const isEarning =
        accountInfo === undefined
            ? false
            : [AccountInfoType.Delegator, AccountInfoType.Baker].includes(accountInfo?.type);
    if (isEarning) {
        return <Percent />;
    }
    return null;
}

export default function AccountSelector({ showAccountSelector, onUpdateSelectedAccount }: Props) {
    const { t } = useTranslation('x', { keyPrefix: 'header.accountSelector' });
    const credentialsLoading = useAtomValue(credentialsAtomWithLoading);
    const [selectedAccount, setSelectedAccount] = useAtom(selectedAccountAtom);
    const copyAddressToClipboard = useCopyAddress();
    const [search, setSearch] = useState('');
    const [ascSort, setAscSort] = useState(true);
    const credentials = credentialsLoading.value ?? [];
    const filtered = useMemo(
        () =>
            credentials.filter(
                (credential) =>
                    credential.credName.toLowerCase().includes(search.toLowerCase()) ||
                    credential.address.toLowerCase().includes(search.toLowerCase())
            ),
        [search, credentials]
    );
    const sorted = useMemo(() => filtered.sort(ascSort ? compareAsc : compareDesc), [filtered, ascSort]);
    const onAccountClick = (address: string) => () => {
        setSelectedAccount(address);
        onUpdateSelectedAccount();
    };

    const copyAddress = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>, address: string) => {
        event.stopPropagation();
        copyAddressToClipboard(address);
    };

    if (!showAccountSelector) return null;
    return (
        <div className="main-header__account-selector fade-menu-bg">
            <div className="main-header__account-selector_group">
                <div className="main-header__account-selector_search-form">
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
                <div className="main-header__account-selector_list">
                    {sorted.map((credential) => (
                        <Button.Base
                            key={credential.credId}
                            className={clsx('main-header__account-selector_list-item', {
                                active: credential.address === selectedAccount,
                            })}
                            onClick={onAccountClick(credential.address)}
                        >
                            <div className="account">
                                {credential.address === selectedAccount && <CarretRight />}
                                <Text.AdditionalSmall>{displayNameOrSplitAddress(credential)}</Text.AdditionalSmall>
                            </div>
                            <div className="balance">
                                <Text.AdditionalSmall>
                                    <CcdBalance credential={credential} />
                                </Text.AdditionalSmall>
                            </div>
                            <div className="earning">
                                <Earning credential={credential} />
                            </div>
                            <div className="copy">
                                <Button.Base
                                    as="span"
                                    className="transparent button__icon"
                                    onClick={(event) => copyAddress(event, credential.address)}
                                >
                                    <Copy />
                                </Button.Base>
                            </div>
                        </Button.Base>
                    ))}
                </div>
            </div>
        </div>
    );
}
