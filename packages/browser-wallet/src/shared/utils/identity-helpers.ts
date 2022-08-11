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
