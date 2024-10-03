import React from 'react';
import Button from '@popup/popupX/shared/Button';

export default function RestoreIntro() {
    return (
        <div className="restore-container">
            <div className="restore-intro__title">
                <span className="heading_medium">Restore wallet</span>
                <span className="capture__main_small">
                    If you are missing some identities or accounts in your wallet, you can try restoring them here.
                </span>
                <span className="capture__main_small">
                    If you used your secret recovery phrase to create more identities and accounts in another
                    installation of the Concordium wallet, you can also use this option to add them to this
                    installation.
                </span>
            </div>
            <Button className="button-main" onClick={() => {}}>
                Restore
            </Button>
        </div>
    );
}
