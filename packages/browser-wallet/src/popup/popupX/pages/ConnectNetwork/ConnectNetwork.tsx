import React from 'react';
import Lock from '@assets/svgX/lock.svg';
import ArrowBend from '@assets/svgX/arrow-bend-up-left.svg';
import Submit from '@popup/popupX/shared/Form/Submit';
import Form from '@popup/popupX/shared/Form/Form';
import FormInput from '@popup/popupX/shared/Form/Input';

export default function ConnectNetwork() {
    return (
        <div className="connect-network-container">
            <div className="connect-network__title">
                <span className="heading_medium">Connect network</span>
            </div>
            <div className="connect-network__name">
                <span className="text__main_regular">Network name</span>
                <span className="text__main_medium">
                    Concordium Mainnet <Lock />
                </span>
            </div>
            <Form
                onSubmit={() => {}}
                // formMethods={}
                className="setup_network__form"
            >
                {(f) => {
                    return (
                        <>
                            <FormInput
                                register={f.register}
                                name="network"
                                autoFocus
                                label="Node address"
                                value="https://whatevertheaddressIs.com"
                            />
                            <span className="label__main">
                                <ArrowBend />
                                Restore default
                            </span>
                            <Submit className="button-main">Continue</Submit>
                        </>
                    );
                }}
            </Form>
        </div>
    );
}
