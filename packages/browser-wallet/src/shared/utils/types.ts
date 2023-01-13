/* eslint-disable @typescript-eslint/ban-types */
import { IdProofOutput } from '@concordium/web-sdk';
import { RefAttributes } from 'react';
/**
 * @description
 * Makes keys of type optional
 *
 * @example
 * type PartiallyOptionalProps = MakeOptional<{test: string; another: number;}, 'another'>; // {test: string; another?: number;}
 */
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type WithRef<P, R> = P & RefAttributes<R>;

export enum BackgroundResponseStatus {
    Success = 'Success',
    Aborted = 'Aborted',
    Error = 'Error',
}

export interface IdentityIdentifier {
    index: number;
    providerIndex: number;
}

export type CredentialDeploymentBackgroundResponse =
    | {
          status: BackgroundResponseStatus.Success;
          address: string;
      }
    | {
          status: BackgroundResponseStatus.Error;
          reason: string;
      };

export type IdProofBackgroundResponse =
    | {
          status: BackgroundResponseStatus.Success;
          proof: IdProofOutput;
      }
    | {
          status: BackgroundResponseStatus.Error;
          reason: string;
      };

export type RecoveryBackgroundResponse =
    | {
          status: BackgroundResponseStatus.Success;
          added: {
              accounts: { address: string; balance: string }[];
              identities: IdentityIdentifier[];
          };
      }
    | {
          status: BackgroundResponseStatus.Error;
          reason: string;
      };

export type Cis2TransferParametersAccount = {
    Account: [string];
};

export type Cis2TransferParameters = [
    {
        data: string;
        token_id: string;
        amount: string; // bigint
        from: Cis2TransferParametersAccount;
        to: Cis2TransferParametersAccount;
    }
];
