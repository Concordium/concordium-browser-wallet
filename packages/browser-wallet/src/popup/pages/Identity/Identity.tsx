import React, { useEffect } from 'react';
import { useAtom } from 'jotai';
import { selectedIdentityAtom } from '@popup/store/settings';
import IdCard from '@popup/shared/IdCard';
import { IdentityStatus } from '@shared/storage/types';
import axios from 'axios';

// TODO reuse from desktop wallet
/**
 * The list of possible statuses returned by an identity provider
 * when querying for an identity object.
 */
export enum IdentityProviderIdentityStatus {
    /** Pending identity verification and initial account creation. */
    Pending = 'pending',
    /** The identity creation failed or was rejected. */
    Error = 'error',
    /** The identity is ready and the initial account was created and is on chain. */
    Done = 'done',
}

// TODO Improve the typing of 'token'.

export interface PendingIdentityTokenContainer {
    status: IdentityProviderIdentityStatus.Pending;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    token?: any;
    detail: string;
}

export interface DoneIdentityTokenContainer {
    status: IdentityProviderIdentityStatus.Done;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    token: any;
    detail: string;
}

export interface ErrorIdentityTokenContainer {
    status: IdentityProviderIdentityStatus.Error;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    token: any;
    detail: string;
}

export type IdentityTokenContainer =
    | PendingIdentityTokenContainer
    | DoneIdentityTokenContainer
    | ErrorIdentityTokenContainer;

export interface ErrorIdObjectResponse {
    error: string;
    token?: null;
}
export interface DoneIdObjectResponse {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    token: any;
    error?: null;
}

export type IdObjectResponse = ErrorIdObjectResponse | DoneIdObjectResponse;

/**
 * Async timeout
 * time: timeout length, in milliseconds.
 */
export async function sleep(time: number) {
    return new Promise((resolve) => {
        setTimeout(resolve, time);
    });
}

/**
 * Polls the provided location until a valid identity object
 * is available, or that an error is returned.
 *
 * The method has to continue polling until the identity provider returns
 * a concluding status. This is required to prevent the loss of an identity,
 * i.e. an identity was eventually successful at the identity provider, but
 * was already failed locally in the desktop wallet beforehand.
 *
 * @returns the identity object
 */
export async function getIdObject(location: string): Promise<IdObjectResponse> {
    // eslint-disable-next-line no-constant-condition
    while (true) {
        try {
            // eslint-disable-next-line no-await-in-loop
            const response = await axios.get<IdentityTokenContainer>(location);
            const { data } = response;
            if (
                data.status &&
                (data.status === IdentityProviderIdentityStatus.Error ||
                    data.status === IdentityProviderIdentityStatus.Done)
            ) {
                const tokenContainer: DoneIdentityTokenContainer | ErrorIdentityTokenContainer = data;

                if (tokenContainer.status === IdentityProviderIdentityStatus.Done) {
                    return { token: data.token };
                }
                if (tokenContainer.status === IdentityProviderIdentityStatus.Error) {
                    return {
                        error: data.detail,
                    };
                }
            }
            // eslint-disable-next-line no-await-in-loop
            await sleep(10000);
        } catch (error) {
            // eslint-disable-next-line no-await-in-loop
            await sleep(10000);
        }
    }
}

export default function Identity() {
    const [selectedIdentity, updateSelectedIdentity] = useAtom(selectedIdentityAtom);

    useEffect(() => {
        if (selectedIdentity?.status === IdentityStatus.Pending) {
            getIdObject(selectedIdentity.location).then((response) => {
                if (response.error) {
                    updateSelectedIdentity({
                        ...selectedIdentity,
                        status: IdentityStatus.Rejected,
                        error: response.error,
                    });
                } else {
                    updateSelectedIdentity({
                        ...selectedIdentity,
                        status: IdentityStatus.Confirmed,
                        idObject: response.token,
                    });
                }
            });
        }
    }, [selectedIdentity?.id]);

    if (!selectedIdentity) {
        return null;
    }

    return (
        <>
            <IdCard
                name={selectedIdentity.name}
                provider={<p>Test</p>}
                status={selectedIdentity.status}
                onNameChange={(name) => updateSelectedIdentity({ ...selectedIdentity, name })}
            />
            {selectedIdentity.status === IdentityStatus.Confirmed && <p>Attributes</p>}
        </>
    );
}
