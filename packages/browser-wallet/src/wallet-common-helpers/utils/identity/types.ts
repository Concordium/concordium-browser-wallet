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
