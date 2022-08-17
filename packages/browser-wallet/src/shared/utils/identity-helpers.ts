import axios from 'axios';
import {
    sleep,
    IdentityTokenContainer,
    DoneIdentityTokenContainer,
    ErrorIdentityTokenContainer,
    IdentityProviderIdentityStatus,
} from 'wallet-common-helpers';

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

/** The type of the response from the background script during identityIssuance */
export type IdentityIssuanceBackgroundResponse =
    | {
          status: 'Success';
          result: string;
      }
    | {
          status: 'Aborted';
      };
