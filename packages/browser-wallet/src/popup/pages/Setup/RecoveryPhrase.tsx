import PageHeader from '@popup/shared/PageHeader';
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateMnemonic } from '@scure/bip39';
import { wordlist } from '@scure/bip39/wordlists/english';
import Button from '@popup/shared/Button';
import { absoluteRoutes } from '@popup/constants/routes';
import TextArea, { TextArea as ControlledTextArea } from '@popup/shared/Form/TextArea';
import { seedPhraseAtom } from '@popup/state';
import { useAtom, useAtomValue } from 'jotai';
import Form from '@popup/shared/Form';
import { SubmitHandler, Validate } from 'react-hook-form';
import Submit from '@popup/shared/Form/Submit';
import { setupRoutes } from './routes';

export function CreateNewWallet() {
    const navigate = useNavigate();
    const [seedPhrase, setSeedPhrase] = useAtom(seedPhraseAtom);

    useEffect(() => {
        if (!seedPhrase) {
            setSeedPhrase(generateMnemonic(wordlist, 256));
        }
    }, []);

    return (
        <>
            <PageHeader canGoBack>Your secret recovery phrase</PageHeader>
            <div className="mnemonic">
                <div className="p-10">
                    <p>Write down your 24 word recovery phrase. Remember that the order is important.</p>
                </div>
                <ControlledTextArea value={seedPhrase} />
                <Button
                    className="intro__button"
                    width="narrow"
                    onClick={() => navigate(`${absoluteRoutes.setup.path}/${setupRoutes.enterRecoveryPhrase}`)}
                >
                    Continue
                </Button>
            </div>
        </>
    );
}

type FormValues = {
    seedPhraseInput: string;
};

export function EnterRecoveryPhrase() {
    const navigate = useNavigate();
    const seedPhrase = useAtomValue(seedPhraseAtom);

    const handleSubmit: SubmitHandler<FormValues> = () => {
        // TODO Encrypt and store the recovery phrase here.
        navigate(`${absoluteRoutes.setup.path}/${setupRoutes.chooseNetwork}`);
    };

    function validateSeedPhrase(): Validate<string> {
        return (seedPhraseValue) => (seedPhraseValue !== seedPhrase ? 'Incorrect secret recovery phrase' : undefined);
    }

    return (
        <>
            <PageHeader canGoBack>Your secret recovery phrase</PageHeader>
            <div className="mnemonic">
                <div className="p-10">
                    <p>
                        Please enter your 24 words in the correct order and separated by spaces, to confirm your secret
                        recovery phrase.
                    </p>
                </div>
                <Form<FormValues> onSubmit={handleSubmit}>
                    {(f) => {
                        return (
                            <>
                                <TextArea
                                    register={f.register}
                                    name="seedPhraseInput"
                                    rules={{
                                        required: 'A seed phrase must be provided',
                                        validate: validateSeedPhrase(),
                                    }}
                                />
                                <Submit className="intro__button" width="narrow">
                                    Continue
                                </Submit>
                            </>
                        );
                    }}
                </Form>
            </div>
        </>
    );
}
