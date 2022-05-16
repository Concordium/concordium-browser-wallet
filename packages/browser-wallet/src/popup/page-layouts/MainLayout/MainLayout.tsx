import React from 'react';
import { Buffer } from 'buffer/';
import { NavLink, Outlet, Navigate, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAtom, useAtomValue } from 'jotai';

import { absoluteRoutes } from '@popup/constants/routes';
import { selectedAccountAtom, accountsAtom } from '@popup/store/account';

import { AccountTransactionType, AccountAddress, GtuAmount } from '@concordium/web-sdk';

const schema =
    'AQAAABEAAAB0d28tc3RlcC10cmFuc2ZlcgEUAAIAAAALAAAAaW5pdF9wYXJhbXMUAAMAAAAPAAAAYWNjb3VudF9ob2xkZXJzEQALHAAAAHRyYW5zZmVyX2FncmVlbWVudF90aHJlc2hvbGQCFAAAAHRyYW5zZmVyX3JlcXVlc3RfdHRsDggAAAByZXF1ZXN0cxIBBRQABAAAAA8AAAB0cmFuc2Zlcl9hbW91bnQKDgAAAHRhcmdldF9hY2NvdW50CwwAAAB0aW1lc19vdXRfYXQNCgAAAHN1cHBvcnRlcnMRAgsBFAADAAAADwAAAGFjY291bnRfaG9sZGVycxEACxwAAAB0cmFuc2Zlcl9hZ3JlZW1lbnRfdGhyZXNob2xkAhQAAAB0cmFuc2Zlcl9yZXF1ZXN0X3R0bA4BAAAABwAAAHJlY2VpdmUVAgAAAA8AAABSZXF1ZXN0VHJhbnNmZXIBAwAAAAUKCw8AAABTdXBwb3J0VHJhbnNmZXIBAwAAAAUKCw==';

export default function MainLayout() {
    const { t } = useTranslation('mainLayout');
    const accounts = useAtomValue(accountsAtom);
    const [selectedAccount, setSelectedAccount] = useAtom(selectedAccountAtom);
    const navigate = useNavigate();

    if (accounts.length === 0) {
        // Force user to go through setup
        return <Navigate to={absoluteRoutes.setup.path} />;
    }

    return (
        <>
            <header>
                <h3>{t('title')}</h3>
            </header>
            <nav className="main-layout__nav">
                <NavLink to={absoluteRoutes.home.path}>{t('nav.home')}</NavLink> |{' '}
                <NavLink to={absoluteRoutes.setup.path}>{t('nav.setup')}</NavLink>
            </nav>
            <select
                className="main-layout__select-account"
                value={selectedAccount}
                onChange={(e) => setSelectedAccount(e.target.value)}
            >
                {accounts.map((a) => (
                    <option key={a} value={a}>
                        {a}
                    </option>
                ))}
            </select>
            <button
                type="button"
                onClick={() => {
                    const state = {
                        transactionType: AccountTransactionType.SimpleTransfer,
                        transactionPayload: {
                            amount: new GtuAmount(BigInt(1)),
                            toAddress: new AccountAddress('39bKAuC7sXCZQfo7DmVQTMbiUuBMQJ5bCfsS7sva1HvDnUXp13'),
                        },
                    };

                    // TODO resolve route based on incoming message.
                    navigate(absoluteRoutes.sendTransaction.path, { state });
                }}
            >
                {' '}
                SimpleTransfer{' '}
            </button>
            <button
                type="button"
                onClick={() => {
                    const state = {
                        transactionType: AccountTransactionType.UpdateSmartContractInstance,
                        transactionPayload: {
                            amount: new GtuAmount(BigInt(1)),
                            contractAddress: { index: BigInt(11), subindex: BigInt(0) },
                            receiveName: 'two-step-transfer.deposit',
                            maxContractExecutionEnergy: 30000n,
                        },
                        parameter: undefined,
                        schema: Buffer.from(schema, 'base64'),
                    };

                    // TODO resolve route based on incoming message.
                    navigate(absoluteRoutes.sendTransaction.path, { state });
                }}
            >
                {' '}
                UpdateContract - Deposit{' '}
            </button>
            <button
                type="button"
                onClick={() => {
                    const state = {
                        transactionType: AccountTransactionType.UpdateSmartContractInstance,
                        transactionPayload: {
                            amount: new GtuAmount(BigInt(0)),
                            contractAddress: { index: BigInt(11), subindex: BigInt(0) },
                            receiveName: 'two-step-transfer.receive',
                            maxContractExecutionEnergy: 30000n,
                        },
                        parameter: {
                            RequestTransfer: ['1000', '1', '3Y1RLgi5pW3x96xZ7CiDiKsTL9huU92qn6mfxpebwmtkeku8ry'],
                        },
                        schema: Buffer.from(schema, 'base64'),
                    };

                    // TODO resolve route based on incoming message.
                    navigate(absoluteRoutes.sendTransaction.path, { state });
                }}
            >
                {' '}
                UpdateContract - Receive{' '}
            </button>
            <main className="main-layout__content">
                <Outlet />
            </main>
        </>
    );
}
