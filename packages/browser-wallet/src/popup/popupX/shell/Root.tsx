import { Provider } from 'jotai';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { absoluteRoutes } from '@popup/popupX/constants/routes';
import BlockChainParametersContext from '@popup/shared/BlockChainParametersProvider';
import AccountInfoListenerContext from '@popup/shared/AccountInfoListenerContext';
import { Network, Theme, Scaling } from './Providers';

import Routes from './Routes';

export default function Root() {
    return (
        <Provider>
            <MemoryRouter initialEntries={[absoluteRoutes.home.path]}>
                <Network>
                    <Theme>
                        <Scaling>
                            <AccountInfoListenerContext>
                                <BlockChainParametersContext>
                                    <Routes />
                                </BlockChainParametersContext>
                            </AccountInfoListenerContext>
                        </Scaling>
                    </Theme>
                </Network>
            </MemoryRouter>
        </Provider>
    );
}
