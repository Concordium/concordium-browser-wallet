import React, { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { SubmitHandler, Validate } from 'react-hook-form';
import { useAtom } from 'jotai';
import Page from '@popup/popupX/shared/Page';
import Button from '@popup/popupX/shared/Button';
import FormInput from '@popup/popupX/shared/Form/Input';
import Form, { useForm } from '@popup/popupX/shared/Form/Form';
import { NetworkConfiguration } from '@shared/storage/types';
import { customNetworkConfigurationAtom, networkConfigurationAtom } from '@popup/store/settings';
import Lock from '@assets/svgX/lock.svg';

export default function CustomConnectNetwork() {
    const { t } = useTranslation('x', { keyPrefix: 'connect.custom' });

    const [customnet, setCustomnet] = useAtom(customNetworkConfigurationAtom);
    const [currentNetworkConfiguration, setCurrentNetworkConfiguration] = useAtom(networkConfigurationAtom);

    const formRef = useRef<HTMLFormElement>(null);
    const form = useForm<NetworkConfiguration>({ defaultValues: customnet });

    const handleSubmit: SubmitHandler<NetworkConfiguration> = async (formValues) => {
        const parsedForm = { ...formValues, grpcPort: Number(formValues.grpcPort) };
        await setCustomnet(parsedForm);
        await setCurrentNetworkConfiguration(parsedForm);
    };

    const getConnectionStatus = () => {
        if (currentNetworkConfiguration.genesisHash === customnet.genesisHash) {
            return <Lock />;
        }
        return null;
    };

    function validateUrl(): Validate<string> {
        return (urlString) => {
            let url;

            if (!urlString) {
                return undefined;
            }

            try {
                url = new URL(urlString);
            } catch (_) {
                return t('errorUrl');
            }

            if (!(url.protocol === 'http:' || url.protocol === 'https:')) {
                return t('errorUrl');
            }

            return undefined;
        };
    }

    return (
        <Page className="connect-network-x">
            <Page.Top
                heading={
                    <span>
                        {t('customNetwork')} {getConnectionStatus()}
                    </span>
                }
            />
            <Page.Main>
                <Form
                    id="custom-connection-form"
                    formMethods={form}
                    ref={formRef}
                    onSubmit={handleSubmit}
                    className="setup_network__form"
                >
                    {(f) => {
                        return (
                            <>
                                <FormInput
                                    register={f.register}
                                    name="genesisHash"
                                    label={t('genesisHash')}
                                    placeholder="qwertyuiop247f09e1b62982bb71000c516480c5a2c5214dadac6da4b1ad50e5"
                                />
                                <FormInput
                                    register={f.register}
                                    name="grpcUrl"
                                    label={t('grpcUrl')}
                                    placeholder="http://localhost"
                                    rules={{
                                        validate: validateUrl(),
                                    }}
                                />
                                <FormInput
                                    register={f.register}
                                    type="number"
                                    name="grpcPort"
                                    label={t('grpcPort')}
                                    placeholder="20000"
                                />
                                <FormInput
                                    register={f.register}
                                    name="explorerUrl"
                                    label={t('explorerUrl')}
                                    placeholder="http://localhost"
                                    rules={{
                                        validate: validateUrl(),
                                    }}
                                />
                                <FormInput
                                    register={f.register}
                                    name="ccdScanUrl"
                                    label={t('ccdScanUrl')}
                                    placeholder="http://localhost"
                                    rules={{
                                        validate: validateUrl(),
                                    }}
                                />
                            </>
                        );
                    }}
                </Form>
            </Page.Main>
            <Page.Footer>
                <Button.Main
                    form="custom-connection-form"
                    type="submit"
                    label={t('connect')}
                    disabled={form.formState.isSubmitting}
                />
            </Page.Footer>
        </Page>
    );
}
