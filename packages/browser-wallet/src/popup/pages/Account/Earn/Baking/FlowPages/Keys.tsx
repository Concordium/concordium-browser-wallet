import React, { useState } from 'react';
import { AccountAddress, BakerKeysWithProofs, generateBakerKeys, GenerateBakerKeysOutput } from '@concordium/web-sdk';
import { useTranslation } from 'react-i18next';

import Form from '@popup/shared/Form';
import { MultiStepFormPageProps } from '@popup/shared/MultiStepForm';
import { saveData } from '@popup/shared/utils/file-helpers';
import Button from '@popup/shared/Button';
import Modal from '@popup/shared/Modal';
import { WithAccountInfo } from '@popup/shared/utils/account-helpers';
import { useForm } from 'react-hook-form';
import { DisplayKey } from '@popup/shared/TransactionReceipt/displayPayload/DisplayConfigureBaker';
import { getBakerKeyExport } from '@popup/shared/utils/baking-helpers';
import { ConfigureBakerFlowState } from '../utils';

type KeysForm = GenerateBakerKeysOutput;

type KeysProps = MultiStepFormPageProps<ConfigureBakerFlowState['keys'], ConfigureBakerFlowState> & WithAccountInfo;

const KEYS_FILENAME = 'baker-credentials.json';

interface ShowKeysProp {
    keys: BakerKeysWithProofs;
}

function ShowKeys({ keys }: ShowKeysProp) {
    const { t } = useTranslation('shared', { keyPrefix: 'baking' });
    const [showPrompt, setShowPrompt] = useState(false);

    const trigger = (
        <Button faded className="m-t-20" width="wide">
            {t('showKeys')}
        </Button>
    );

    return (
        <Modal
            trigger={trigger}
            open={showPrompt}
            onOpen={() => setShowPrompt(true)}
            onClose={() => setShowPrompt(false)}
        >
            <div>
                <h5 className="m-b-5">{t('electionKey')}</h5>
                <div>
                    <DisplayKey value={keys.electionVerifyKey} />
                </div>
                <h5 className="m-b-5">{t('signatureKey')}</h5>
                <div>
                    <DisplayKey value={keys.signatureVerifyKey} />
                </div>
                <h5 className="m-b-5">{t('aggregationKey')}</h5>
                <div>
                    <DisplayKey value={keys.aggregationVerifyKey} />
                </div>
            </div>
        </Modal>
    );
}

export default function KeysPage({ initial, onNext, accountInfo }: KeysProps) {
    const { t } = useTranslation('account', { keyPrefix: 'baking.configure' });
    const [showPrompt, setShowPrompt] = useState(false);
    const form = useForm<KeysForm>({
        // TODO #delegation: test this on a slow computer, does it need to be moved to background script?
        defaultValues: initial || generateBakerKeys(new AccountAddress(accountInfo.accountAddress)),
    });
    const keys = form.watch();

    const saveKeys = () => {
        saveData(getBakerKeyExport(keys, accountInfo), KEYS_FILENAME);
        setShowPrompt(true);
    };

    return (
        <Form<KeysForm> className="configure-flow-form" formMethods={form} onSubmit={onNext}>
            {(f) => (
                <>
                    <Modal open={showPrompt} onClose={() => setShowPrompt(false)}>
                        <div>
                            <h3 className="m-t-0">{t('keys.downloadedTitle')}</h3>
                            <div> {t('keys.downloaded', { fileName: KEYS_FILENAME })} </div>
                            <Button className="m-t-20" width="wide" onClick={f.handleSubmit(onNext)}>
                                {t('continueButton')}
                            </Button>
                        </div>
                    </Modal>
                    <div className="m-t-0">{t('keys.description')}</div>
                    <ShowKeys keys={keys} />
                    <Button className="m-t-auto" width="wide" onClick={saveKeys}>
                        {t('keys.save')}
                    </Button>
                </>
            )}
        </Form>
    );
}
