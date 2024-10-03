import React from 'react';
import Button from '@popup/popupX/shared/Button';

const RECOVERY_PHRASE =
    'meadow salad weather rural next promote fence mass leopard mail regret mushroom love coral viable layer lumber soft setup radar oppose miracle rural agree'.split(
        ' '
    );

export default function RecoveryPhrase() {
    return (
        <div className="recovery-phrase-container">
            <div className="recovery-phrase__title">
                <span className="heading_medium">Your secret recovery phrase</span>
                <span className="capture__main_small">
                    Please enter your 24 words in the correct order and separated by spaces, to confirm your secret
                    recovery phrase.
                </span>
            </div>
            <div className="recovery-phrase__card">
                {RECOVERY_PHRASE.map((word) => (
                    <span className="label__regular">{word}</span>
                ))}
            </div>
            <Button className="button-main" onClick={() => {}}>
                Continue
            </Button>
        </div>
    );
}
