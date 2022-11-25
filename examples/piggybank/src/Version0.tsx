/* eslint-disable no-console */
import React, { useEffect, useState, useMemo, useContext, useRef } from 'react';
import { deserializeContractState, InstanceInfoV0, isInstanceInfoV0, toBuffer } from '@concordium/web-sdk';
import { detectConcordiumProvider } from '@concordium/browser-wallet-api-helpers';
import { smash, deposit, state, CONTRACT_NAME } from './utils';

import PiggyIcon from './assets/piggy-bank-solid.svg';
import HammerIcon from './assets/hammer-solid.svg';

const CONTRACT_INDEX = 6n; // V0 instance
const CONTRACT_SUB_INDEX = 0n;
const CONTRACT_SCHEMA = toBuffer('AQAAAAkAAABQaWdneUJhbmsBFQIAAAAGAAAASW50YWN0AgcAAABTbWFzaGVkAgAAAAAA', 'base64');

// Rust enums translated to JSON.
type PiggyBankStateIntact = { Intact: [] };
type PiggyBankStateSmashed = { Smashed: [] };

type PiggyBankState = PiggyBankStateIntact | PiggyBankStateSmashed;

const isPiggybankSmashed = (piggyState: PiggyBankState): piggyState is PiggyBankStateSmashed =>
    (piggyState as PiggyBankStateSmashed).Smashed !== undefined;

export default function PiggyBankV0() {
    const { account, isConnected } = useContext(state);
    const [piggybank, setPiggyBank] = useState<InstanceInfoV0>();
    const input = useRef<HTMLInputElement>(null);

    useEffect(() => {
        // Get piggy bank data.
        detectConcordiumProvider()
            .then((provider) =>
                provider.getJsonRpcClient().getInstanceInfo({ index: CONTRACT_INDEX, subindex: CONTRACT_SUB_INDEX })
            )
            .then((info) => {
                if (info?.name !== `init_${CONTRACT_NAME}`) {
                    // Check that we have the expected instance.
                    throw new Error(`Expected instance of PiggyBank: ${info?.name}`);
                }
                if (!isInstanceInfoV0(info)) {
                    // Check smart contract version. We expect V0.
                    throw new Error('Expected SC version 0');
                }

                setPiggyBank(info);
            });
    }, []);

    // The internal state of the piggy bank, which is either intact or smashed.
    const piggyBankState: PiggyBankState | undefined = useMemo(
        () =>
            piggybank?.model !== undefined
                ? deserializeContractState(CONTRACT_NAME, CONTRACT_SCHEMA, piggybank.model)
                : undefined,
        [piggybank?.model]
    );

    // Disable use if we're not connected or if piggy bank has already been smashed.
    const canUse = isConnected && piggyBankState !== undefined && !isPiggybankSmashed(piggyBankState);

    return (
        <>
            {piggybank === undefined ? (
                <div>Loading piggy bank...</div>
            ) : (
                <>
                    <h1 className="stored">{Number(piggybank?.amount.microCcdAmount) / 1000000} CCD</h1>
                    <div>
                        Owned by
                        <br />
                        {piggybank?.owner.address}
                    </div>
                    <br />
                    <div>State: {isPiggybankSmashed(piggyBankState as PiggyBankState) ? 'Smashed' : 'Intact'}</div>
                </>
            )}
            <br />
            <label>
                <div className="container">
                    <input className="input" type="number" placeholder="Deposit amount" ref={input} />
                    <button
                        className="deposit"
                        type="button"
                        onClick={() =>
                            account &&
                            deposit(account, CONTRACT_INDEX, CONTRACT_SUB_INDEX, input.current?.valueAsNumber)
                        }
                        disabled={account === undefined || !canUse}
                    >
                        <PiggyIcon height="20" />
                    </button>
                </div>
            </label>
            <br />
            <br />
            <button
                className="smash"
                type="button"
                onClick={() => account && smash(account, CONTRACT_INDEX, CONTRACT_SUB_INDEX)}
                disabled={account === undefined || account !== piggybank?.owner.address || !canUse} // The smash button is only active for the contract owner.
            >
                <HammerIcon width="40" />
            </button>
        </>
    );
}
