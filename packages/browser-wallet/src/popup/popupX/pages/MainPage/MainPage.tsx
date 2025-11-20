import React, { ReactNode, useMemo, useState } from 'react';
import { generatePath, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAtom, useAtomValue } from 'jotai';
import clsx from 'clsx';
import { AccountInfo, AccountInfoType, Ratio } from '@concordium/web-sdk';
import { absoluteRoutes, relativeRoutes } from '@popup/popupX/constants/routes';
import Img from '@popup/shared/Img';
import { ConfirmedCredential, CreationStatus, WalletCredential } from '@shared/storage/types';
import { useAccountInfo } from '@popup/shared/AccountInfoListenerContext';
import { useFlattenedAccountTokens } from '@popup/pages/Account/Tokens/utils';
import { getMetadataUnique } from '@shared/utils/token-helpers';
import { autoAddPltToAccount, contractBalancesFamily } from '@popup/store/token';
import { useBlockChainParameters } from '@popup/shared/BlockChainParametersProvider';
import { displayCcdAsEur, formatTokenAmount } from '@popup/popupX/shared/utils/helpers';
import Page from '@popup/popupX/shared/Page';
import Text from '@popup/popupX/shared/Text';
import Button from '@popup/popupX/shared/Button';
import { withSelectedCredential } from '@popup/popupX/shared/utils/hoc';
import { PLT } from '@shared/constants/token';
import ArrowUp from '@assets/svgX/UiKit/Arrows/arrow-up.svg';
import ArrowDown from '@assets/svgX/UiKit/Arrows/arrow-down.svg';
import Arrow from '@assets/svgX/arrow-right.svg';
import Clock from '@assets/svgX/UiKit/MenuNavigation/clock-activity-history-time.svg';
import Plus from '@assets/svgX/UiKit/Interface/plus-add-buy.svg';
import ConcordiumLogo from '@assets/svgX/UiKit/Custom/concordium-glyph-only.svg';
import Percent from '@assets/svgX/UiKit/Interface/percentage-earn-staking.svg';
import Gear from '@assets/svgX/UiKit/Interface/settings-gear-cog.svg';
import Shield from '@assets/svgX/UiKit/Interface/shield-square-crypto.svg';
import RestoreSeed from '@assets/svgX/UiKit/Interface/restore-seed-phrase.svg';
import WalletCoin from '@assets/svgX/UiKit/Interface/wallet-coin.svg';
import Dot from '@assets/svgX/dot.svg';
import Info from '@assets/svgX/info.svg';
import Pause from '@assets/svgX/pause.svg';
import Tooltip from '@popup/popupX/shared/Tooltip';
import { credentialsAtom, credentialsAtomWithLoading, selectedAccountAtom } from '@popup/store/account';
import { hasBeenSavedSeedAtom } from '@popup/store/settings';
import { SuspendedStatus, useSuspendedStatus } from '@popup/popupX/shared/utils/pool-status-helpers';
import Modal from '@popup/popupX/shared/Modal';

/** Hook loading every fungible token added to the account. */
function useAccountFungibleTokens(account: WalletCredential) {
    const tokens = useFlattenedAccountTokens(account);
    return tokens.filter((t) => !getMetadataUnique(t.metadata));
}

/**
 Hook loading every PLT token received from the accountTokens.
 Called only from the MainPage, not from some global context in order to avoid conflicts between auto/manually/externally added tokens
 */
const useAutoAddPlt = (accountInfo: AccountInfo | undefined) => {
    const autoAddPlt = useMemo(() => autoAddPltToAccount(accountInfo), [accountInfo]);
    useAtom(autoAddPlt);
};

/** Hook for loading the CIS-2 token balance of some account. */
function useAccountTokenBalance(accountAddress: string, contractAddress: string, tokenId: string) {
    const { [tokenId]: balance } = useAtomValue(contractBalancesFamily(accountAddress, contractAddress));
    return balance;
}

type TokenBalanceProps = { decimals?: number; tokenId: string; contractAddress: string; accountAddress: string };
/** Component for fetching and displaying a CIS-2 token balance of an account. */
function AccountTokenBalance({ decimals, tokenId, contractAddress, accountAddress }: TokenBalanceProps) {
    const balanceRaw = useAccountTokenBalance(accountAddress, contractAddress, tokenId) ?? 0n;
    const balance = useMemo(() => formatTokenAmount(balanceRaw, decimals, 2, 2), [balanceRaw]);
    return <span>{balance}</span>;
}

function mainPageCcdDisplay(microCcdAmount: bigint) {
    return formatTokenAmount(microCcdAmount, 6, 2, 2);
}

function Balance({ credential }: { credential: WalletCredential }) {
    const { t } = useTranslation('x', { keyPrefix: 'mainPage' });
    const accountInfo = useAccountInfo(credential);

    if (!accountInfo) {
        return null;
    }

    const ccdBalance = mainPageCcdDisplay(accountInfo.accountAmount.microCcdAmount);
    const ccdAvailableBalance = mainPageCcdDisplay(accountInfo.accountAvailableBalance.microCcdAmount);

    return (
        <div className="main-page-x__balance">
            <div className="main-page-x__balance_info">
                <Text.DynamicSize baseFontSize={55} baseTextLength={10} className="heading_large">
                    {ccdBalance} CCD
                </Text.DynamicSize>
                <Tooltip position="top" title={t('tooltip.title')} text={t('tooltip.text')} className="info-icon">
                    <Info />
                </Tooltip>
            </div>
            {accountInfo.accountAmount.microCcdAmount !== accountInfo.accountAvailableBalance.microCcdAmount && (
                <Text.MainRegular className="available-balance">
                    {ccdAvailableBalance} {t('available')}
                </Text.MainRegular>
            )}
        </div>
    );
}

type TokenItemProps = {
    thumbnail: string | ReactNode;
    symbol: string;
    balance: string | ReactNode;
    balanceBase?: bigint;
    staked?: boolean;
    isPlt?: boolean;
    microCcdPerEur?: Ratio;
    onClick: () => void;
};
function TokenItem({
    thumbnail,
    symbol,
    isPlt,
    balance,
    balanceBase,
    staked,
    microCcdPerEur,
    onClick,
}: TokenItemProps) {
    const { t } = useTranslation('x', { keyPrefix: 'mainPage' });
    const isNoExchange = microCcdPerEur === undefined || balanceBase === undefined;
    return (
        <Button.Base onClick={onClick} className="main-page-x__tokens-list_item">
            <div className="token-icon">
                {typeof thumbnail === 'string' ? <Img src={thumbnail} alt={symbol} withDefaults /> : thumbnail}
            </div>
            <div className="token-balance">
                <div className="token-balance__amount">
                    <div className="token-status">
                        <div className="token-symbol">
                            <Text.Label>{symbol}</Text.Label>
                            {staked && <Percent />}
                        </div>
                        {isPlt && (
                            <div className="token-plt">
                                <Shield />
                                <Text.Capture>{t('plt')}</Text.Capture>
                            </div>
                        )}
                    </div>
                    <span className="balance-rate">
                        <Text.Label>{balance}</Text.Label>
                        {isNoExchange ? null : (
                            <div className="token-balance__exchange-rate">
                                <Text.Capture>{displayCcdAsEur(microCcdPerEur, balanceBase, 2)}</Text.Capture>
                            </div>
                        )}
                    </span>
                </div>
            </div>
        </Button.Base>
    );
}

function useSuspendedInfo(credential: WalletCredential) {
    const accountInfo = useAccountInfo(credential);
    const suspendedStatus = useSuspendedStatus(accountInfo);

    return { accountInfoType: accountInfo?.type, suspendedStatus, address: credential.address };
}

function SuspendedNavButton({ address, message }: { address: string; message: string }) {
    const nav = useNavigate();
    const [, setSelectedAccount] = useAtom(selectedAccountAtom);

    const navToEarn = () => nav(absoluteRoutes.settings.earn.path);

    const onClick = () => {
        setSelectedAccount(address || '').then(() => navToEarn());
    };

    return (
        <Button.Base onClick={onClick} className="main-page-x__suspended-earn-info_button">
            <Pause />
            <Text.Capture>{message}</Text.Capture>
            <Arrow />
        </Button.Base>
    );
}

function SuspendedEarnInfo() {
    const { t } = useTranslation('x', { keyPrefix: 'mainPage' });
    const credentialsLoading = useAtomValue(credentialsAtomWithLoading);
    const credentials = credentialsLoading.value ?? [];

    const filteredCredentials = credentials
        .filter(({ address }) => address)
        .map((credential) => useSuspendedInfo(credential));

    const validationSuspended = filteredCredentials.find(
        ({ accountInfoType, suspendedStatus }) =>
            accountInfoType === AccountInfoType.Baker && suspendedStatus === SuspendedStatus.suspended
    );
    const validationPrimed = filteredCredentials.find(
        ({ accountInfoType, suspendedStatus }) =>
            accountInfoType === AccountInfoType.Baker && suspendedStatus === SuspendedStatus.isPrimedForSuspension
    );
    const validatorSuspended = filteredCredentials.find(
        ({ accountInfoType, suspendedStatus }) =>
            accountInfoType === AccountInfoType.Delegator && suspendedStatus === SuspendedStatus.suspended
    );

    return (
        <div className="main-page-x__suspended-earn-info">
            {validationSuspended && (
                <SuspendedNavButton address={validationSuspended.address} message={t('validationSuspended')} />
            )}
            {!validationSuspended && validationPrimed && (
                <SuspendedNavButton address={validationPrimed.address} message={t('validationIsPrimedForSuspension')} />
            )}
            {validatorSuspended && (
                <SuspendedNavButton address={validatorSuspended.address} message={t('validatorSuspended')} />
            )}
        </div>
    );
}

function MainPageCta() {
    const { t } = useTranslation('x', { keyPrefix: 'mainPage' });
    const nav = useNavigate();
    const [showPrompt, setShowPrompt] = useState(false);
    const [hasBeenSavedSeed, setHasBeenSavedSeed] = useAtom(hasBeenSavedSeedAtom);
    const navToSaveSeedPhrase = () => nav(absoluteRoutes.settings.saveSeedPhrase.path);

    if (hasBeenSavedSeed) return null;

    return (
        <>
            <Modal className="cta_modal" middle open={showPrompt} onClose={() => setShowPrompt(false)}>
                <Text.Main>{t('cta.modal.sure')}</Text.Main>
                <Text.MainRegular>{t('cta.modal.recommendBackup')}</Text.MainRegular>
                <Button.Main
                    inverse
                    variant="secondary"
                    label={t('cta.modal.hide')}
                    onClick={() => {
                        setHasBeenSavedSeed(true);
                        setShowPrompt(false);
                    }}
                />
                <Button.Main
                    inverse
                    label={t('cta.modal.backup')}
                    onClick={() => {
                        setShowPrompt(false);
                        navToSaveSeedPhrase();
                    }}
                />
            </Modal>
            <Button.HomepageCta
                icon={<RestoreSeed />}
                title={t('cta.backup')}
                description={t('cta.keepSafe')}
                onClick={navToSaveSeedPhrase}
                onCancel={() => setShowPrompt(true)}
            />
        </>
    );
}

type MainPageConfirmedAccountProps = { credential: ConfirmedCredential };

function MainPageConfirmedAccount({ credential }: MainPageConfirmedAccountProps) {
    const { t } = useTranslation('x', { keyPrefix: 'mainPage' });

    const nav = useNavigate();
    const navToSend = () => nav(generatePath(absoluteRoutes.home.sendFunds.path, { account: credential.address }));
    const navToReceive = () => nav(relativeRoutes.home.receive.path);
    const navToEarn = () => nav(absoluteRoutes.settings.earn.path);
    const navToBuy = () => nav(absoluteRoutes.home.onramp.path);
    const navToTransactionLog = () =>
        nav(relativeRoutes.home.transactionLog.path.replace(':account', credential.address));
    const navToTokenDetails = (contractIndex: string) =>
        nav(absoluteRoutes.home.token.details.path.replace(':contractIndex', contractIndex));
    const navToPltDetails = (pltSymbol: string) =>
        nav(absoluteRoutes.home.token.plt.path.replace(':pltSymbol', pltSymbol));

    const navToManageToken = () => nav(relativeRoutes.home.manageTokenList.path);

    const chainParameters = useBlockChainParameters();
    const microCcdPerEur = chainParameters?.microGTUPerEuro;
    const accountInfo = useAccountInfo(credential);
    const tokens = useAccountFungibleTokens(credential);
    const isSuspended = useSuspendedStatus(accountInfo);

    useAutoAddPlt(accountInfo);

    if (accountInfo === undefined) {
        return <>Loading</>;
    }

    const isStaked = [AccountInfoType.Delegator, AccountInfoType.Baker].includes(accountInfo.type);

    return (
        <Page className="main-page-x">
            <Balance credential={credential} />
            <MainPageCta />
            <div className="main-page-x__action-buttons">
                <Button.IconTile icon={<Plus />} label={t('buy')} onClick={navToBuy} className="buy" />
                <Button.IconTile icon={<ArrowDown />} label={t('receive')} onClick={navToReceive} className="receive" />
                <Button.IconTile icon={<ArrowUp />} label={t('send')} onClick={navToSend} className="send" />
                <Button.IconTile
                    icon={<Percent />}
                    label={t('earn')}
                    onClick={navToEarn}
                    className={clsx({ suspend: isSuspended })}
                />
                <Button.IconTile icon={<Clock />} label={t('activity')} onClick={navToTransactionLog} />
            </div>
            <div className="main-page-x__tokens">
                <div className="main-page-x__tokens-list">
                    <TokenItem
                        onClick={() => nav(absoluteRoutes.home.token.ccd.path)}
                        thumbnail={<ConcordiumLogo />}
                        symbol="CCD"
                        staked={isStaked}
                        balance={mainPageCcdDisplay(accountInfo.accountAmount.microCcdAmount)}
                        balanceBase={accountInfo.accountAmount.microCcdAmount}
                        microCcdPerEur={microCcdPerEur}
                    />
                    {tokens.map((token) => (
                        <TokenItem
                            onClick={() =>
                                token.contractIndex === PLT
                                    ? navToPltDetails(token.id)
                                    : navToTokenDetails(token.contractIndex)
                            }
                            key={`${token.contractIndex}.${token.id}`}
                            thumbnail={token.metadata.thumbnail?.url || ''}
                            symbol={token.metadata.symbol || ''}
                            isPlt={token.contractIndex === PLT}
                            balance={
                                <AccountTokenBalance
                                    decimals={token.metadata.decimals}
                                    contractAddress={token.contractIndex}
                                    accountAddress={credential.address}
                                    tokenId={token.id}
                                />
                            }
                        />
                    ))}
                    <Button.Tertiary onClick={navToManageToken} iconLeft={<Gear />} label={t('manageTokenList')} />
                </div>
            </div>
            <SuspendedEarnInfo />
        </Page>
    );
}

function MainPagePendingAccount() {
    const { t } = useTranslation('x', { keyPrefix: 'mainPage' });
    const nav = useNavigate();
    return (
        <Page className="main-page-x">
            <div className="main-page-x__balance">
                <div className="main-page-x__balance_info">
                    <Text.DynamicSize baseFontSize={55} baseTextLength={10} className="heading_large">
                        0.00 CCD
                    </Text.DynamicSize>
                    <Tooltip position="top" title={t('tooltip.title')} text={t('tooltip.text')} className="info-icon">
                        <Info />
                    </Tooltip>
                </div>
            </div>
            <div className="main-page-x__pending">
                <div className="pending-icon">
                    <WalletCoin />
                </div>
                <Text.Main>{t('pendingSubText')}</Text.Main>
                <Dot />
            </div>
            <div className="main-page-x__action-buttons">
                <Button.IconTile icon={<Plus />} label={t('buy')} disabled className="buy" />
                <Button.IconTile icon={<ArrowDown />} label={t('receive')} disabled className="receive" />
                <Button.IconTile icon={<ArrowUp />} label={t('send')} disabled className="send" />
                <Button.IconTile icon={<Percent />} label={t('earn')} disabled />
                <Button.IconTile icon={<Clock />} label={t('activity')} disabled />
            </div>
            <div className="main-page-x__tokens">
                <div className="main-page-x__tokens-list">
                    <TokenItem
                        onClick={() => nav(absoluteRoutes.home.token.ccd.path)}
                        thumbnail={<ConcordiumLogo />}
                        symbol="CCD"
                        balance={mainPageCcdDisplay(0n)}
                        balanceBase={0n}
                    />
                    <Button.Tertiary disabled iconLeft={<Gear />} label={t('manageTokenList')} />
                </div>
            </div>
        </Page>
    );
}

function MainPageNoAccounts() {
    const { t } = useTranslation('x', { keyPrefix: 'mainPage' });
    const nav = useNavigate();

    return (
        <Page className="main-page-x create-account">
            <Page.Top heading={t('createAccount')} />
            <Page.Main>
                <Text.Capture>{t('noAccounts')}</Text.Capture>
            </Page.Main>
            <Page.Footer>
                <Button.Main
                    label={t('createAccount')}
                    onClick={() => nav(absoluteRoutes.settings.createAccount.path)}
                />
            </Page.Footer>
        </Page>
    );
}

function MainPageRejectedAccount() {
    const { t } = useTranslation('x', { keyPrefix: 'mainPage' });

    return (
        <Page className="main-page-x rejected-account">
            <Page.Top heading={t('error')} />
            <Page.Main>
                <Text.Capture>{t('accountCreationRejected')}</Text.Capture>
            </Page.Main>
        </Page>
    );
}

type MainPageProps = { credential: WalletCredential };

function MainPage({ credential }: MainPageProps) {
    switch (credential.status) {
        case CreationStatus.Confirmed:
            return <MainPageConfirmedAccount credential={credential} />;
        case CreationStatus.Pending:
            return <MainPagePendingAccount />;
        case CreationStatus.Rejected:
            return <MainPageRejectedAccount />;
        default:
            throw new Error(`Unexpected status for credential`);
    }
}

function MainPageCredentials() {
    const credentials = useAtomValue(credentialsAtom);

    if (credentials.length === 0) {
        return <MainPageNoAccounts />;
    }

    const PageWithCredential = withSelectedCredential(MainPage);

    return <PageWithCredential />;
}

export default MainPageCredentials;
