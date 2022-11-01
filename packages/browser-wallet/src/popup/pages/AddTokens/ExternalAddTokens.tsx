import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useLocation } from 'react-router-dom';
import { displayUrl } from '@popup/shared/utils/string-helpers';
import ConnectedBox from '@popup/pages/Account/ConnectedBox';
import { addToastAtom } from '@popup/state';
import ExternalRequestLayout from '@popup/page-layouts/ExternalRequestLayout';
import { currentAccountTokensAtom } from '@popup/store/token';
import { useAsyncMemo } from 'wallet-common-helpers';
import { TokenIdAndMetadata } from '@shared/storage/types';
import { ContractTokenDetails, fetchContractName } from '@shared/utils/token-helpers';
import { jsonRpcClientAtom, networkConfigurationAtom } from '@popup/store/settings';
import { selectedAccountAtom } from '@popup/store/account';
import { fullscreenPromptContext } from '@popup/page-layouts/FullscreenPromptLayout';
import { Input as UncontrolledInput } from '@popup/shared/Form/Input';
import Button from '@popup/shared/Button';
import { isHex } from '@concordium/web-sdk';
import ContractTokenLine, { ChoiceStatus } from '@popup/shared/ContractTokenLine';
import TokenDetails from '@popup/shared/TokenDetails';
import { getTokens } from '../Account/AddTokens/utils';

type Props = {
    respond(ids: string[]): void;
};

type TokenWithChoice = ContractTokenDetails & { status: ChoiceStatus };

const getId = (token: TokenIdAndMetadata) => token.id;
const onlyExisting = (token: TokenWithChoice) => token.status === ChoiceStatus.existing;

interface Location {
    state: {
        payload: {
            contractIndex: string;
            contractSubindex: string;
            tokenIds: string[];
            url: string;
        };
    };
}

export default function SignMessage({ respond }: Props) {
    const { state } = useLocation() as Location;
    const { t } = useTranslation('account', { keyPrefix: 'tokens' });
    const { withClose, onClose } = useContext(fullscreenPromptContext);
    const { contractIndex, contractSubindex, tokenIds, url } = state.payload;
    const addToast = useSetAtom(addToastAtom);
    const client = useAtomValue(jsonRpcClientAtom);
    const network = useAtomValue(networkConfigurationAtom);
    const account = useAtomValue(selectedAccountAtom);
    const [accountTokens, setAccountTokens] = useAtom(currentAccountTokensAtom);
    const [addingTokens, setAddingTokens] = useState<TokenWithChoice[]>();
    const [detailView, setDetailView] = useState<number>();

    // If the window is closed, we avoid leaking information.
    useEffect(() => onClose(() => respond([])), [onClose, respond]);

    const onFinish = (newTokens: TokenIdAndMetadata[]) => {
        setAccountTokens({ contractIndex, newTokens }).then(withClose(() => respond(newTokens.map(getId))));
    };

    const contractDetails = useAsyncMemo(
        async () => {
            const name = await fetchContractName(client, BigInt(contractIndex), BigInt(contractSubindex));
            if (!name) {
                throw new Error('Test');
            }
            return { index: BigInt(contractIndex), subindex: BigInt(contractSubindex), contractName: name };
        },
        (e) => addToast(e.message),
        []
    );

    useEffect(() => {
        if (!contractDetails || accountTokens.loading || !account) {
            return;
        }
        const existingIds = (accountTokens.value[contractIndex] || []).map((token) => token.id);
        const filteredIds =
            // Remove duplicates
            [...new Set(tokenIds)]
                // Remove any ids that are not proper hex strings.
                .filter((id) => isHex(id));

        getTokens(contractDetails, client, network, account, filteredIds).then((newTokens) =>
            setAddingTokens(
                newTokens
                    .filter((token) => token.metadata)
                    .map(
                        (token) =>
                            ({
                                ...token,
                                status: existingIds?.some((id) => id === token.id)
                                    ? ChoiceStatus.existing
                                    : ChoiceStatus.chosen,
                            } as TokenWithChoice)
                    )
            )
        );
    }, [contractDetails, accountTokens.loading, account]);

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
        <ExternalRequestLayout>
            <ConnectedBox accountAddress={account} url={new URL(url).origin} />
            {detailView !== undefined && (
                <TokenDetails
                    contractIndex={contractIndex}
                    balance={addingTokens[detailView].balance}
                    token={addingTokens[detailView]}
                    onClose={() => setDetailView(undefined)}
                />
            )}
            {detailView === undefined && (
                <div className="h-full flex-column align-center">
                    <p>
                        {t(allExisting ? 'prompt.descriptionAllExisting' : 'prompt.description', {
                            dApp: displayUrl(url),
                        })}
                    </p>
                    <UncontrolledInput
                        readOnly
                        className="add-tokens-prompt__input w-full"
                        label={t('contractName')}
                        value={contractDetails.contractName}
                    />
                    <div className="add-tokens-prompt__token-container w-full">
                        {addingTokens.map((token, index) => (
                            <ContractTokenLine
                                key={token.id}
                                status={token.status}
                                token={token}
                                onToggleChecked={() => updateTokenStatus(index)}
                                onClick={() => setDetailView(index)}
                            />
                        ))}
                    </div>
                    <div className="flex p-b-10  m-t-auto">
                        {allExisting || (
                            <>
                                <Button
                                    width="narrow"
                                    className="m-r-10"
                                    onClick={withClose(() => respond(addingTokens.filter(onlyExisting).map(getId)))}
                                >
                                    {t('prompt.reject')}
                                </Button>
                                <Button
                                    width="narrow"
                                    onClick={() =>
                                        onFinish(
                                            addingTokens
                                                .filter((token) => token.status !== ChoiceStatus.discarded)
                                                .map(({ status, ...token }) => token)
                                        )
                                    }
                                >
                                    {t('prompt.add')}
                                </Button>
                            </>
                        )}
                        {allExisting && (
                            <Button width="wide" onClick={withClose(() => respond(addingTokens.map(getId)))}>
                                {t('prompt.finish')}
                            </Button>
                        )}
                    </div>
                </div>
            )}
        </ExternalRequestLayout>
    );
}
