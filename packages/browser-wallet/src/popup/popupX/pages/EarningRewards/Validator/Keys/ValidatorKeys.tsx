import React from 'react';
import ExportIcon from '@assets/svgX/sign-out.svg';

export default function ValidatorKeys() {
    return (
        <div className="validator-keys-container">
            <div className="validator-keys__title">
                <span className="heading_medium">validator keys</span>
                <span className="capture__main_small">on Accout 1 / 6gk...k7o</span>
            </div>
            <span className="capture__main_small">
                Your new validator keys have been generated. Before you can continue, you must export and save them. The
                keys will have to be added to the validator node. Besides exporting the keys, you will have to finish
                and submit the transaction afterwards for the validator to be registered.
            </span>
            <div className="validator-keys__card">
                <div className="validator-keys__card_row">
                    <span className="capture__main_small">Election verify key</span>
                    <span className="capture__main_small">
                        474564hhfjdjde5f8f9g7fnsnsjs9e7g8f7fs64d3s3f6vb90f9d8d8dd66d
                    </span>
                </div>
                <div className="validator-keys__card_row">
                    <span className="capture__main_small">Signature verify key</span>
                    <span className="capture__main_small">
                        9f6g5e6g8gh9g9r7d4fghgfdx76gv5b4hg4fd5sxs9cvbn9m9nhgf77dfgh
                    </span>
                </div>
                <div className="validator-keys__card_row">
                    <span className="capture__main_small">Aggregation verify key</span>
                    <span className="capture__main_small">
                        4f84fg3gb6d9s9s3s1d46gg9grf7jmf9xc5c7s5x3vn80b8c6x5x4f84fg3gb6d9s9s3s1d46gg9grf7jmf9xc5c7s5x3vn80b8c6x5x4f84fg3gb6d9s9s3s1d46gg9grf7jmf9xc5c7s5x3vn80b8c6x5x4f84fg3gb6d9s9s3s1d46gg9grf7jmf9xc5c7s5x3vn80b8c6x5xdjd9f7g66673
                    </span>
                </div>
            </div>
            <div className="validator-keys__export">
                <ExportIcon />
                <span className="label__main">Export validator keys</span>
            </div>
        </div>
    );
}
