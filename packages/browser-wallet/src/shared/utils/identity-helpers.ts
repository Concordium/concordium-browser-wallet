import { ConfirmedIdentity, WalletCredential } from '@shared/storage/types';
import { BackgroundResponseStatus, IdentityIdentifier } from './types';

/** The type of the response from the background script during identityIssuance */
export type IdentityIssuanceBackgroundResponse =
    | {
          status: BackgroundResponseStatus.Success;
          result: string;
      }
    | {
          status: BackgroundResponseStatus.Aborted;
      }
    | {
          status: BackgroundResponseStatus.Error;
          reason: string;
      };

/**
 * Curried function, which checks whether two identityIdentifiers match.
 */
export const identityMatch = (target: IdentityIdentifier) => (candidate: IdentityIdentifier) =>
    target.index === candidate.index && target.providerIndex === candidate.providerIndex;

/**
 * Curried function, which checks whether the given identityIdentifier matches the credential's identity.
 */
export const isIdentityOfCredential = (id: IdentityIdentifier) => (cred: WalletCredential) =>
    id.index === cred.identityIndex && id.providerIndex === cred.providerIndex;

export function getMaxAccountsForIdentity(identity: ConfirmedIdentity) {
    if (identity.idObject.v !== 0) {
        throw new Error('unsupported identity object version');
    }
    return identity.idObject.value.attributeList.maxAccounts;
}
