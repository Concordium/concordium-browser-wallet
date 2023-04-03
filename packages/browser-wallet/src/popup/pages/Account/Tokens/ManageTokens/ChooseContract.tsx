import React, { useCallback, useEffect, useRef } from 'react';
import { useAtom, useAtomValue } from 'jotai';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import Form from '@popup/shared/Form';
import FormInput from '@popup/shared/Form/Input';
import Submit from '@popup/shared/Form/Submit';
import { grpcClientAtom } from '@popup/store/settings';
import { confirmCIS2Contract, ContractDetails } from '@shared/utils/token-helpers';
import { selectedAccountAtom } from '@popup/store/account';
import { ensureDefined } from '@shared/utils/basic-helpers';
import { debouncedAsyncValidate } from '@popup/shared/utils/validation-helpers';
import { contractDetailsAtom, contractTokensAtom } from './state';
import { fetchTokensConfigure, FetchTokensResponse } from './utils';
import { tokensRoutes } from '../routes';

const VALIDATE_INDEX_DELAY_MS = 500;

type FormValues = {
    contractIndex: string;
};

/**
 * Component used to choose the contract index for a CIS-2 compliant smart contract instance.
 */
export default function ChooseContract() {
    const { t } = useTranslation('account', { keyPrefix: 'tokens.add' });
    const [contractDetails, setContractDetails] = useAtom(contractDetailsAtom);
    const form = useForm<FormValues>({
        defaultValues: { contractIndex: contractDetails?.index?.toString() },
    });
    const contractIndexValue = form.watch('contractIndex');
    const client = useAtomValue(grpcClientAtom);
    const nav = useNavigate();
    const validContract = useRef<{ details: ContractDetails; tokens: FetchTokensResponse } | undefined>();
    const account = ensureDefined(useAtomValue(selectedAccountAtom), 'No account has been selected');
    const [, updateTokens] = useAtom(contractTokensAtom);

    const onSubmit: SubmitHandler<FormValues> = async () => {
        if (validContract.current === undefined) {
            throw new Error('Expected contract details');
        }

        setContractDetails(validContract.current.details);
        updateTokens({ type: 'reset', initialTokens: validContract.current.tokens });

        nav(`../${tokensRoutes.manage}`, { replace: true });
    };

    const validateIndex = useCallback(
        debouncedAsyncValidate<string>(
            async (value) => {
                let index;
                try {
                    index = BigInt(value);
                } catch {
                    return t('invalidIndex');
                }

                if (index < 0n) {
                    return t('negativeIndex');
                }

                if (index >= 2n ** 64n) {
                    return t('indexMax');
                }

                let instanceInfo;
                try {
                    instanceInfo = await client.getInstanceInfo({ index, subindex: 0n });
                } catch {
                    return t('noContractFound');
                }

                const contractName = instanceInfo.name.substring(5);
                const cd: ContractDetails = { contractName, index, subindex: 0n };
                const error = await confirmCIS2Contract(client, cd);

                if (error !== undefined) {
                    return error;
                }

                const fetchErrors: string[] = [];

                const response = await fetchTokensConfigure(cd, client, account, (e) => {
                    fetchErrors.push(e);
                })();

                if (fetchErrors.length > 0) {
                    return t('failedTokensError', { errors: fetchErrors.join('\n') });
                }
                if (response.tokens.length === 0) {
                    return t('noTokensError');
                }

                validContract.current = { details: cd, tokens: response };
                return true;
            },
            VALIDATE_INDEX_DELAY_MS,
            true
        ),
        [client]
    );

    useEffect(() => {
        validContract.current = undefined;
    }, [contractIndexValue]);

    return (
        <Form
            className="h-full w-full flex-column p-10 justify-space-between text-center"
            formMethods={form}
            onSubmit={onSubmit}
        >
            {(f) => (
                <>
                    <div>
                        <p className="m-t-0">{t('chooseContractHeader')}</p>
                        <FormInput
                            register={f.register}
                            label={t('contractIndex')}
                            name="contractIndex"
                            rules={{
                                required: t('indexRequired'),
                                validate: validateIndex,
                            }}
                        />
                    </div>

                    <Submit>{t('lookupTokens')}</Submit>
                </>
            )}
        </Form>
    );
}
