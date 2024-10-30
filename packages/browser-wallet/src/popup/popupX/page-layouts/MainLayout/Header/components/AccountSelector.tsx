import React, { ChangeEvent, useMemo, useState } from 'react';
import CarretRight from '@assets/svgX/caret-right.svg';
import ArrowsUpDown from '@assets/svgX/arrows-down-up.svg';
import { Search } from '@popup/popupX/shared/Form/Search';
import Button from '@popup/popupX/shared/Button';
import { useAtom, useAtomValue } from 'jotai';
import { credentialsAtomWithLoading, selectedAccountAtom } from '@popup/store/account';
import { displayNameAndSplitAddress } from '@popup/shared/utils/account-helpers';
import { useAccountInfo } from '@popup/shared/AccountInfoListenerContext';
import { displayAsCcd } from 'wallet-common-helpers';
import { WalletCredential } from '@shared/storage/types';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { tokensAtom } from '@popup/store/token';
import Img from '@popup/shared/Img';

function CcdBalance({ credential }: { credential: WalletCredential }) {
    const accountInfo = useAccountInfo(credential);
    const balance =
        accountInfo === undefined ? '' : displayAsCcd(accountInfo.accountAmount.microCcdAmount, false, true);
    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{balance}</>;
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

export default function AccountSelector({ showAccountSelector, onUpdateSelectedAccount }: Props) {
    const { t } = useTranslation('x', { keyPrefix: 'header.accountSelector' });
    const credentialsLoading = useAtomValue(credentialsAtomWithLoading);
    const [selectedAccount, setSelectedAccount] = useAtom(selectedAccountAtom);
    const [search, setSearch] = useState('');
    const [ascSort, setAscSort] = useState(true);
    const credentials = credentialsLoading.value ?? [];
    const tokens = useAtomValue(tokensAtom);
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
                {sorted.map((credential) => (
                    <Button.Base
                        className={clsx('main-header__account-selector_list-item', {
                            active: credential.address === selectedAccount,
                        })}
                        onClick={onAccountClick(credential.address)}
                    >
                        <div className="account">
                            {credential.address === selectedAccount && <CarretRight />}
                            <span className="text__additional_small">{displayNameAndSplitAddress(credential)}</span>
                        </div>
                        <div className="balance">
                            <span className="text__additional_small">
                                <CcdBalance credential={credential} />
                            </span>
                        </div>
                        <div className="tokens">
                            {tokens.loading ||
                                Object.values(tokens.value[credential.address]).flatMap((contractTokens) =>
                                    contractTokens.flatMap((token) =>
                                        token.metadata.thumbnail?.url === undefined
                                            ? []
                                            : [
                                                  <div className="token-icon">
                                                      <Img
                                                          src={token.metadata.thumbnail.url}
                                                          alt={token.metadata.symbol ?? '?'}
                                                          withDefaults
                                                      />
                                                  </div>,
                                              ]
                                    )
                                )}
                        </div>
                    </Button.Base>
                ))}
            </div>
        </div>
    );
}
