import React, { useContext, useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import Page from '@popup/popupX/shared/Page';
import Text from '@popup/popupX/shared/Text';
import { useUrlDisplay } from '@popup/popupX/shared/utils/helpers';
import Card from '@popup/popupX/shared/Card';
import Button from '@popup/popupX/shared/Button';
import TokenList from '@popup/popupX/shared/TokenList';
import { useLocation } from 'react-router-dom';
import { ContractAddress, isHex } from '@concordium/web-sdk';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { addToastAtom } from '@popup/state';
import { grpcClientAtom } from '@popup/store/settings';
import { accountTokensFamily } from '@popup/store/token';
import { ContractTokenDetails, fetchContractName, getTokens } from '@shared/utils/token-helpers';
import { ChoiceStatus } from '@popup/shared/ContractTokenLine';
import { useAsyncMemo } from 'wallet-common-helpers';
import FullscreenNotice from '@popup/popupX/shared/FullscreenNotice';
import Copy from '@assets/svgX/copy.svg';
import Img from '@popup/shared/Img';
import Notebook from '@assets/svgX/notebook.svg';
import { useCopyToClipboard } from '@popup/popupX/shared/utils/hooks';
import { TokenIdAndMetadata } from '@shared/storage/types';
import { fullscreenPromptContext } from '@popup/popupX/page-layouts/FullscreenPromptLayout';

const SUB_INDEX = 0;

type TokenDetailProps = {
    token: TokenWithChoice;
    contractAddress: ContractAddress.Serializable;
    detailsIsOpen: boolean;
    setDetailsIsOpen(value: React.SetStateAction<boolean>): void;
};

function TokenDetails({ token, contractAddress, detailsIsOpen, setDetailsIsOpen }: TokenDetailProps) {
    const { t } = useTranslation('x', { keyPrefix: 'tokenDetails' });
    const [rawDataIsOpen, setRawDataIsOpen] = useState(false);
    const copyToClipboard = useCopyToClipboard();
    const { index, subindex } = contractAddress;
    const { metadata = {}, id } = token || { metadata: {} };
    const { thumbnail, display, symbol, name, description, decimals } = metadata;

    return (
        <>
            <FullscreenNotice open={rawDataIsOpen} onClose={() => setRawDataIsOpen(false)}>
                <Page>
                    <Page.Top heading={t('rawMetadata')}>
                        <Button.Icon
                            icon={<Copy />}
                            onClick={() => copyToClipboard(JSON.stringify(metadata, null, 2))}
                        />
                    </Page.Top>
                    <Page.Main>
                        <Card>
                            {Object.entries(metadata).map(([k, v]) => (
                                <Card.RowDetails key={k} title={k} value={JSON.stringify(v)} />
                            ))}
                        </Card>
                    </Page.Main>
                </Page>
            </FullscreenNotice>
            <FullscreenNotice open={detailsIsOpen} onClose={() => setDetailsIsOpen(false)}>
                <Page className="token-details-x">
                    <Page.Main>
                        <Card>
                            <div className="token-details-x__token">
                                <Img
                                    className="token-icon"
                                    src={thumbnail?.url || display?.url || ''}
                                    alt={symbol}
                                    withDefaults
                                />
                                <Text.Main>{name}</Text.Main>
                            </div>
                            <Card.RowDetails title={t('description')} value={description} />
                            {decimals && <Card.RowDetails title={t('decimals')} value={`0 - ${decimals}`} />}
                            {id && <Card.RowDetails title={t('tokenId')} value={id} />}
                            <Card.RowDetails title={t('indexSubindex')} value={`${index}, ${subindex || SUB_INDEX}`} />
                        </Card>
                        <Button.IconText
                            icon={<Notebook />}
                            label={t('showRawMetadata')}
                            onClick={() => {
                                setRawDataIsOpen(true);
                            }}
                        />
                    </Page.Main>
                </Page>
            </FullscreenNotice>
        </>
    );
}

type TokenRowProps = {
    token: TokenWithChoice;
    index: number;
    contractAddress: ContractAddress.Serializable;
    updateTokenStatus(index: number): void;
};

function TokenRow({ token, index, contractAddress, updateTokenStatus }: TokenRowProps) {
    const [detailsIsOpen, setDetailsIsOpen] = useState(false);
    const { status } = token;

    return (
        <>
            <TokenDetails
                token={token}
                contractAddress={contractAddress}
                detailsIsOpen={detailsIsOpen}
                setDetailsIsOpen={setDetailsIsOpen}
            />
            <TokenList.Item
                thumbnail={token.metadata?.display?.url}
                symbol={token.metadata?.name}
                balance={{
                    amount: token.balance,
                    symbol: token.metadata?.symbol,
                    decimals: token.metadata?.decimals,
                }}
                checked={status === ChoiceStatus.chosen || status === ChoiceStatus.existing}
                disabled={status === ChoiceStatus.existing}
                onClick={() => {
                    setDetailsIsOpen(true);
                }}
                onSelect={() => {
                    updateTokenStatus(index);
                }}
            />
        </>
    );
}

interface Location {
    state: {
        payload: {
            accountAddress: string;
            contractAddress: ContractAddress.Serializable;
            tokenIds: string[];
            url: string;
        };
    };
}

type TokenWithChoice = ContractTokenDetails & { status: ChoiceStatus };

const getId = (token: TokenIdAndMetadata) => token.id;

type Props = {
    respond(ids: string[]): void;
};

export default function AddTokens({ respond }: Props) {
    const { t } = useTranslation('x', { keyPrefix: 'prompts.addTokensX' });
    const { state } = useLocation() as Location;
    const { onClose, withClose } = useContext(fullscreenPromptContext);
    const {
        accountAddress,
        contractAddress: { index: contractIndex, subindex: contractSubindex },
        tokenIds,
    } = state.payload;
    const addToast = useSetAtom(addToastAtom);
    const client = useAtomValue(grpcClientAtom);
    const [accountTokens, setAccountTokens] = useAtom(accountTokensFamily(accountAddress));
    const [addingTokens, setAddingTokens] = useState<TokenWithChoice[]>([]);

    const [urlDisplay] = useUrlDisplay();

    // If the window is closed, we avoid leaking information.
    useEffect(() => onClose(() => respond([])), [onClose, respond]);

    const onFinish = (newTokens: TokenIdAndMetadata[]) => {
        setAccountTokens({ contractIndex, newTokens }).then(withClose(() => respond(newTokens.map(getId))));
    };

    const contractDetails = useAsyncMemo(
        async () => {
            const name = await fetchContractName(client, BigInt(contractIndex), BigInt(contractSubindex));
            if (!name) {
                throw new Error('Unable to fetch name for given contract');
            } else {
                return { index: BigInt(contractIndex), subindex: BigInt(contractSubindex), contractName: name };
            }
        },
        (e) => addToast(e.message),
        []
    );

    useEffect(() => {
        if (!contractDetails || accountTokens.loading) {
            return;
        }
        const existingIds = (accountTokens.value[contractIndex] || []).map((token) => token.id);
        // Remove duplicates
        const withoutDuplicates = [...new Set(tokenIds)];
        if (tokenIds.length !== withoutDuplicates.length) {
            addToast(t('filterDuplicate'));
        }
        // Remove any ids that are not proper hex strings.
        const filteredIds = withoutDuplicates.filter((id) => isHex(id) || id === '');
        if (withoutDuplicates.length !== filteredIds.length) {
            addToast(t('filterInvalid'));
        }

        getTokens(contractDetails, client, accountAddress, filteredIds, addToast).then((newTokens) => {
            const tokensToAdd = newTokens
                .filter((token) => token.metadata)
                .map(
                    (token) =>
                        ({
                            ...token,
                            status: existingIds?.some((id) => id === token.id)
                                ? ChoiceStatus.existing
                                : ChoiceStatus.chosen,
                        } as TokenWithChoice)
                );
            if (tokensToAdd.length !== newTokens.length) {
                addToast(t('filterMissingMetadata'));
            }
            setAddingTokens(tokensToAdd);
        });
    }, [contractDetails, accountTokens.loading, accountAddress]);

    if (!contractDetails || !addingTokens) {
        return null;
    }

    const updateTokenStatus = (index: number) => {
        const token = addingTokens[index];
        const status = token.status === ChoiceStatus.chosen ? ChoiceStatus.discarded : ChoiceStatus.chosen;
        addingTokens[index] = { ...token, status };
        setAddingTokens([...addingTokens]);
    };

    const allExisting = addingTokens.every(({ status }) => status === ChoiceStatus.existing);

    return (
        <Page className="add-tokens-x">
            <Page.Top heading={t('addTokens')} />
            <Page.Main>
                <Text.Main>
                    <Trans
                        ns="x"
                        i18nKey="prompts.addTokensX.connectTo"
                        components={{ 1: <span className="white" /> }}
                        values={{ dApp: urlDisplay || 'concordium.com' }}
                    />
                </Text.Main>
                <Card>
                    <Card.Row>
                        <Text.MainRegular>{t('contractName')}</Text.MainRegular>
                        <Text.MainMedium>{contractDetails?.contractName}</Text.MainMedium>
                    </Card.Row>
                </Card>
                <TokenList>
                    {addingTokens.map((token, index) => (
                        <TokenRow
                            key={token.id}
                            token={token}
                            index={index}
                            contractAddress={{ index: contractIndex, subindex: contractSubindex }}
                            updateTokenStatus={updateTokenStatus}
                        />
                    ))}
                </TokenList>
            </Page.Main>
            <Page.Footer>
                {allExisting || (
                    <>
                        <Button.Main className="secondary" label={t('cancel')} onClick={withClose(() => respond([]))} />
                        <Button.Main
                            label={t('add')}
                            onClick={() =>
                                onFinish(
                                    addingTokens
                                        .filter((token) => token.status !== ChoiceStatus.discarded)
                                        .map(({ status, ...token }) => token)
                                )
                            }
                        />
                    </>
                )}
                {allExisting && (
                    <Button.Main label={t('finish')} onClick={withClose(() => respond(addingTokens.map(getId)))} />
                )}
            </Page.Footer>
        </Page>
    );
}
