# Changelog

## 2.4.1

### Added

-   Fiat on-ramp in the Browser Wallet.

## 2.4.0

### Removed

-   Google Analytics track screens and events

## 2.3.0

### Added

-   Google Analytics track screens and events

### Fixed

-   CIS-2 token validation of available funds, at Send Token screen
-   Memo input at Send Transaction screen should not be displayed for CIS-2 tokens

### Changed

-   Updated delegation description help link from `node` list to `staking`

## 2.2.0

### Added

-   Memo input field at Send Transaction screen
-   Added support for TransferWithMemo transaction type
-   Updated Send transaction status screens
-   Preview of memo at Transaction Log
-   Memo field at Transaction details screen

## 2.1.2

### Added

-   Updated version of @concordium/web-sdk to ver.-9 (with new protocol8 update)
-   New info cards 'validation is primed for suspension' and 'validation is suspended' for Validators
-   New info cards 'validator suspended' for Delegators
-   New page with description of self-suspend action
-   Added action to suspend/resume validation
-   Suspended and primed for suspension validator accounts are marked with red dot at accounts list and Main page. Additionally, delegators with suspended target validators also marked.
-   Info notification at the Main page, about validator suspension

### Fixed

-   Fixed earn status screen 'Nav back button' redirect to main page

## 2.0.2

### Fixed

-   Fixed credentials with address undefined

## 2.0.1

### Fixed

-   Fixed credentials with some fields undefined

## 2.0.0

### Added

-   Overhauled the Browser Wallet’s interface as part of the CryptoX UI Revamp project.
    This update will align the browser wallet’s design with look of CryptoX,
    delivering a more seamless and user-friendly experience while preserving all the existing features.

## 1.7.2

### Fixed

-   Remove unused "downloads" permission from manifest.

## 1.7.1

### Changed

-   Updated screens mentioning stake cooldowns to reflect protocol version 7 cooldown changes

## 1.7.0

### Added

-   Updated version of @concordium/web-sdk to ver.-8 (with new protocol7 update)
-   Additional cooldown card with info about pending changes, if delegation was updated
-   Updated properties checks in `poolStatus` according to new types
-   Updated `accountAvailableBalance` value which is now received from the web-sdk

### Fixed

-   Window height change on modal open

## 1.6.4

### Fixed

-   Prepare for Company ID providers on Mainnet by using wallet proxy endpoint `/v2/ip_info`.

## 1.6.3

### Fixed

-   Use new wallet proxy endpoint `/v2/ip_info` on Testnet, which includes Company ID Providers, as these are now removed from the `/v1/ip_info`.

## 1.6.2

### Fixed

-   Ensure that the wallet API and the wallet are built with the same version of the web-sdk, fixing an issue that caused serialization of values to not conform to the expected format.

## 1.6.1

### Fixed

-   Update web-sdk fixing the `unreachable` runtime error during account creation with id object containing attributes using special characters.

## 1.6.0

### Added

-   Support creating accounts from Company IDs.

## 1.5.2

### Added

-   Added new option to edit account name. Name saved in local storage. Changed name displayed across all BrowserWallet.
-   Additional error message. Now instead of not showing invalid tokens, they displayed in token list with corresponding error. In order to show, that we found tokens in contract, but they have error.
-   Added signCIS3Message method for explicit CIS3 sign in walletApi, and new page SignCIS3Message to display decoded CIS3 message.

### Changed

-   Display the optional name for ID providers when present, otherwise fallback to the chain name.
-   Increased padding for QR code background. In dark mode, QR code not blending with background.

### Fixed

-   Remove check for redirectUri when launching identity issuance. This check was causing issues with an upcoming identity provider and seems to provide no value.

## 1.5.1

### Fixed

-   Inject script being loaded on every tab update event, instead now only when loading is completed.

## 1.5.0

### Added

-   A button in settings that opens the wallet in fullscreen mode in a tab.

### Fixed

-   An issue where some proof requests for nationality or country of residence would be misintrepreted as asking whether in the EU or not.
-   Inject script not loading on the first page of a new tab, causing API to not be available for dApps.

## 1.4.2

### Fixed

-   The token transfer estimate now takes the transfer amount into account.
-   No longer blocks creating the last possible account for an identity.

## 1.4.1

### Fixed

-   An issue where the identity selected for creating a new account was swapped with another identity if the wallet contained failed identities.
-   An issue where the deprecated function `getGrpcClient` in the wallet-api returned the wrong type.

## 1.4.0

### Added

-   Recovery can now be aborted when an identity has not yet been found.

### Fixed

-   An issue where, in some cases, the wrong list of identity providers was used when recovering from the wallet settings menu.

## 1.3.2

### Added

-   A page in settings to display the secret recovery phrase.

### Fixed

-   Updating stake crashing if the amount as microCCD exceeds 64 bits.

## 1.3.1

### Changed

-   CIS-2 token lookup no longer blocks choosing a contract, if looking up metadata or balance only fails for some tokens.

### Fixed

-   Inject script loading wasm module, unnecessarily.
-   Missing date for delegation/validation stake decrease/stop has been restored.
-   Changing restake preference is no longer blocked when below minimum stake threshold.
-   `SendTransaction` in wallet-api now supports `bigint` as part of smart contract parameters, fixing an issue with using large numbers.

## 1.3.0

### Added

-   The EuroE token is now added to all accounts by default.

## 1.2.1

### Fixed

-   Some mistakes in the validation renaming.

## 1.2.0

### Changed

-   Baker/baking renamed to validator/validation in UI.
-   Default name for key file is now `validator-credentials.json`.
-   Hide finalization commission rate in validator flows.
-   Updated baker/delegation icons in the account list.

## 1.1.11

### Fixed

-   Sign message's rendered view displaying 'a' when deserialization failed.
-   Sign message's stringification failing with new `deserializeTypeValue`.
-   An issue where the max contract execution energy was not rendered correctly for init contract transactions.
-   Updated web-sdk to fix an issue where init contract transactions were not serialized correctly.
-   Errors in wallet-api from version mismatch between wallet and dApps.

## 1.1.10

### Changed

-   Refactoring to support new SDK version.

### Added

-   `grpcTransport` to the wallet-api.

### Removed

-   `getJsonRpcClient` from the wallet-api.

### Deprecated

-   `getGrpcClient` in favor of the new `grpcTransport`. (and has been removed from the types in api-helpers)

## 1.1.9

### Added

-   When creating/updating a baker, the commission rates can now be changed, if the ranges are not singletons.

## 1.1.8

### Added

-   A simple page for web3Id age proofs.

### Fixed

-   UI adjustments for proof request page.

## 1.1.7

### Fixed

-   Changed 'Zero Knowledge' to 'Zero-knowledge' in display texts.
-   An issue with images in verifiable credentials for lower resolutions.
-   Schema validation of verifiable credentials with attributes that have `{ type: "integer" }` no longer rejects BigInt values.

## 1.1.6

### Fixed

-   On the proof request page, routing back to credential statements no longer resets the selection.
-   Update according to the change to AttributeType from the SDK. In particular the timestamp type is now explicit, and therefore we have removed hhe special serialization/parsing of Dates when exporting/import verifiable credentials.

### Fixed

-   Verifiable credentials are now validated according to the schema when being added. This will e.g. block setting an attribute as an integer if the schema defines it as a string.
-   Refreshed the schema for credential schemas so that attribute types are now restricted as expected (`string`, `integer` and the special types are allowed).
-   An issue where credential schemas were not updated with the correct key.
-   UI improvements to the credential selector.

## 1.1.5

### Added

-   Indicator on proof request page, to show how many credential statements are requested, and the current position.

### Fixed

-   An issue where Date attributes were saved as strings when exported. This would mean that they would lose typing and the credential would be broken.
-   An issue where statement parameters were not validated according to the attribute bounds.

## 1.1.4

### Added

-   The wallet now validates verifiable credential attributes based on their type. String attributes can at most be 31 bytes (UTF-8), integer attributes must fit in a u64 and Date attributes must be between -262144-01-01T00:00:00 and +262143-12-31T23:59:59.999999999Z'.

### Changed

-   Adjusted the schema validation for credential schemas to no longer require title and description. The type is now required to be 'object'.

### Fixed

-   An issue where changing the credential metadata URL to an invalid URL, or a URL that does not contain a credential metadata file, would result in an empty screen.
-   Issues with a contract switching to an invalid schema or switching the schema to a new URL.
-   The wallet now ensures that the verifiable credential index used when adding a credential has not already been used in the contract.
-   An issue where an invalid Date would result in the epoch timestamp instead of returning an error.
-   Enabled ID statement checks for Web3 ID proof requests containing account credential statements.

## 1.1.3

### Changed

-   The status of a credential being added is now `Pending` instead of `NotActivated`.

### Fixed

-   An issue where the import window would fail to open.
-   Updated the JSON schema for the verifiable credential schema validation, so that invalid schemas are rejected.
-   An issue where a verifiable with the `NotActivated` status would show as `Pending`.
-   Enable validation of veriable presentation requests before opening the popup window.
-   An issue that allowed empty credential statements to be accepted by the wallet-api.
-   An issue where the wallet allowed for requests adding credentials with more attributes than listed in the schema.

## 1.1.2

### Added

-   Validation of required attributes when adding a credential.
-   Display contract address of issuer in verifiable credential details.

### Fixed

-   Incorrect verifiable presentations created, due to incorrect identity/identityProviderIndex used.
-   Wallet crashing when showing a proof request, while having a verifiable credential that is not yet on chain (or we otherwise fail to retrieve the status)
-   Show verifiable credentials in overview before they are put on chain.

## 1.1.1

### Fixed

-   Support number properties as bigints for verifiable credentials.
-   Use localization for verifiable credentials.
-   Fix wallet crashing when importing verifiable credentials with new schemas.

## 1.1.0

### Added

-   Web3IdCredentials support.

## 1.0.7

### Added

-   Support for protocol version 6.

## 1.0.6

### Changed

-   In the display of a `deployModule` transaction, the previously titled module hash is now titled module reference.

### Added

-   Display of a `deployModule` transaction now includes a copy button for the module reference.

### Fixed

-   First call of the gRPC client no longer always fails.
-   First call of the gRPC client after changing network now uses the correct network.
-   Updated web-sdk to fix incorrect estimated cost for `deployModule` transaction.

## 1.0.5

### Added

-   A build script for making builds that include the stagenet network.
-   `deployModule` transactions now display the hash instead of the entire module source.
-   Text that a transaction has been submitted.

### Fixed

-   The About page link to the terms and conditions pointed to the wrong URL. It now uses the value retrieved from the wallet proxy, or the correct default to the unified terms and conditions page.
-   Link to transaction log on stagenet was incorrect.
-   Fixed an empty recovery displaying an error instead of informing the user that nothing was found.
-   An issue where the transaction list view would show the `Request CCD` button while loading the initial batch of transactions.
-   Added a missing translation for the `Request CCD` button.
-   `deployModule` transactions no longer cause the wallet to crash, when supplied with `sendTransaction`.

### Changed

-   Messages when confirming baker/delegation transactions no longer appears after the transaction has been submitted.

## 1.0.4

### Fixed

-   Validate during Baker/delegation stake reduction that at disposal funds can cover the fee.
-   Delegation target being changed to passive delegation when the user did not choose to update it.
-   Improve display of errors from the node when sending transactions.

## 1.0.3

### Fixed

-   Some typos in the delegation texts.

## 1.0.2

### Added

-   Popups, when stopping baking or delegation, that inform the user about the cooldown period.
-   Popups, when updating baking/delegation, that inform the user that the update will take effect after the next payday, and reminders to give baker keys to the node.
-   Display expected cost while choosing amount in configureBaker flows.
-   Display expected cost while choosing amount in configureDelegation flows.

### Changed

-   Updated messages when confirming baker/delegation transactions.

### Fixed

-   Some issues in the baking and delegation text.
-   Added missing key to events in the list of events inside the transaction details.
-   Baking and delegation icons now also work in dark mode.
-   An application crash when attempting to update the baker stake.
-   Delegation target always defaulting to baker, even if current target was a passive delegation.
-   Fixed incorrect cost used to validate baker stake.

## 1.0.1

### Added

-   SendTransaction now validates that an account has sufficient funds before sending a transaction (requested though the api).
-   Support for eID (Criipto) identity document types.
-   An icon is now shown in the account list if an account is either baking or delegating.
-   The stake label in the account balance view now shows whether the user is baking, delegating or doing neither.
-   When creating an account that already exist, it will now be added to the wallet.

### Changed

-   Improved readability of events in transaction details.
-   When choosing baker stake amount, the minimumEquityCapital is no longer the default value for non bakers.
-   Baker transactions no longer display a minimum of 3 decimals when confirming the transaction.
-   Added warning when decreasing stake.
-   Added info when confirming transactions, for registering/lowering stake/removing baker and delegation.
-   Changed header while registering a baker to `Register baker`.
-   When registering as a baker, restaking and being open for delegation are now the default options.
-   When registering for delegation, restaking and targeting a baker are now the default options.

### Fixed

-   In the manage page for adding CIS-2 tokens, the contract index is now always initially empty.
-   Incorrect navigation flow on the "earn" page when switching between accounts.
-   Issues with the expansion of the account balance details view when navigating through different flows.
-   Recovery no longer assigns duplicate names to identities when new identities are visited earlier than existing ones during the recovery process.
-   AddCIS2Tokens through API now adds tokens to the given account, instead of the currently selected one.
-   Missing translations for some identity attributes.
-   The bakerKey export is now the correct format that the node expects. (It now includes `bakerId` and the private keys)
-   Removed double unit on CCD in token overview.
-   A bug that caused an identity to not be recovered if there was a rejected one present in the same index.

## 1.0.0

### Added

-   Flows for starting, updating and stopping baking.
-   Flows for starting, updating and stopping delegation.

### Changed

-   Use gRPC-web instead of json-RPC.
-   The initial view in the manage token flow now retains the token page header, doesn't collapse account balances and the error messages for looking up a contract have been improved.

### Fixed

-   Handling of UpdateAccountKey transactions from wallet-proxy.

### Fixed

-   `chainChanged` event is correctly propagated to all (not just whitelisted) dapps listening for events through the wallet API.
-   When changing the selected chain internally in the wallet, dapps now receive `accountChanged` event if an account on the new network has the dapp whitelisted, or `accountDisconnected` event if no account on the new network has the dapp whitelisted.

## 0.9.11

### Fixed

-   Wallet crashing if sendTransaction contained parameters that could not be serialized. (The request is rejected instead)
-   No longer crashes when opening modals (Like token raw metadata)

## 0.9.10

### Changed

-   Updated text when signing arbitrary data with signMessage.

### Fixed

-   Duplicate key error when sending multiple transactions.
-   Crash when going back in transfer flow. (introduced in 0.9.9)

## 0.9.9

### Added

-   Support for signing arbitrary data with signMessage.

### Fixed

-   Bug for transferring tokens where validation was hardcoded to assume 6 decimals.
-   Bug for transferring tokens where tokens with integer value above 64 bits caused a crash.

## 0.9.8

### Fixed

-   Bug in bugfix for CIS-2 token metadata url serialization for tokens with checksums.

## 0.9.7

### Fixed

-   Incorrect CIS-2 token metadata url serialization for tokens with checksums, causing those to be unable to be added.
-   Init contract transaction now displays as "Contract initialization".
-   Update contract transaction now displays as "Contract update".
-   `addCIS2Tokens` now returns the list of added tokens without an internal wrapper.

## 0.9.6

### Added

-   SendTransaction for smart contract transactions can receive schemas that are for the specific parameter.

## 0.9.5

### Fixed

-   Wording in id proofs popup.
-   Age display now includes birthday. So it now happens and display for 18 years or older instead of more than 18 years.
-   ID cards now appear clickable when creating an account
-   Transaction log now properly displays incoming transactions from smart contracts.

## 0.9.4

### Fixed

-   Various wording and display errors in id proofs popup.
-   Add missing details when displaying some id statements.

## 0.9.3

### Fixed

-   Wording and missing links in id proofs info boxes.
-   Prompt at accept Terms and conditions appearing when T&C had not been updated.

## 0.9.2

### Fixed

-   Small UI bug.

## 0.9.1

### Added

-   Page linking to ccdscan for exporting an account statement for any given account. This feature is available under account settings.

### Fixed

-   Various bugs.

## 0.9.0

### Added

-   Support for generating zero knowledge proofs requested from web applications.

### Changed

-   Arranged the image of a collectible at the top of the collectible details page.

## 0.8.5

### Fixed

-   Blank prompt when requesting an `initContract` transaction with parameters.

## 0.8.4

### Fixed

-   Incorrect id on token being displayed in manage tokens, when searching.
-   Spelling errors and incomplete sentences.

### Added

-   Prompt user to accept terms and conditions, if they change.

## 0.8.3

### Fixed

-   Smart contract parameters parsing through wallet-api failing.
-   Smart contract parameters through wallet-api parsing zero as no parameters.

## 0.8.2

### Fixed

-   Various bugs.

## 0.8.1

### Fixed

-   Various bugs.

## 0.8.0

### Added

-   A toast is now shown when the passcode is successfully updated.
-   Shows submitted transactions in the transaction list.
-   Support for viewing and transferring CIS-2 tokens

### Changed

-   Default view for account page is now CIS-2 token list

## 0.7.5

### Fixed

-   An issue where the account balance was always shown as 0 on the recovery page.

## 0.7.4

### Fixed

-   JSON-RPC URL on mainnet.

## 0.7.3

### Fixed

-   An issue where the wrong identity was selected when choosing an identity during account creation.
-   An issue where identity issuance could not be completed, due to service worker going inactive.
-   Ensure that confirmation of entities is resumed if service worker goes inactive.

## 0.7.2

### Fixed

-   Recovered accounts not showing in recovery results when the identity is already present.
-   Popup after Identity creation not appearing.
-   Connected sites are now stored per network.

## 0.7.1

### Fixed

-   Crash when confirming account creation.
-   Identity creation not starting.

## 0.7.0

### Added

-   Export account and it's private key as a file.

### Fixed

-   Various bugs.

## 0.6.0

### Added

-   Recovery from settings.

### Changed

-   Updated external prompt pages UI.

### Fixed

-   Various bugs.

## 0.5.0

### Added

-   Toasts for showing errors when failing to retrieve account balance or transaction history.
-   Send CCD page.
-   Transaction history is now updated on balance changes, so that the new transactions are retrieved.
-   Testnet faucet for getting some CCD for testing.
-   Terms and conditions to setup flow and the about page.

### Changed

-   Account information retrieved from the JSON-RPC server is now cached for better performance, and a more responsive UI.

### Fixed

-   Account search now only searches on the account address field.
-   Identities and accounts statuses are now resolved correctly on first installation of the wallet, without requiring a restart.

## 0.4.0

### Added

-   Login screen.
-   Change passcode settings page.
-   Transaction details view when clicking a transaction in the transaction list.
-   Theme toggle button to the settings page.
-   Export private key account settings page.
-   Identity issuance.
-   Account creation.

### Changed

-   The network connections page has been updated with new UI.

### Removed

-   Visual settings page.
-   Adding accounts manually with private key

## 0.3.0 2022-8-18

### Added

-   Account setting for controlling connected websites that can interact with the wallet.
-   About page in the settings menu.
-   Transaction history.
-   Added display of account address as text and QR code in the "Receive CCD" section.

### Changed

-   Account details view has been updated and retrieves the account balances from the JSON-RPC server.

## 0.2.1 2022-7-26

### Fixed

-   Sending V1 contracts updates/initializations with parameters now works.

## 0.2.0 2022-6-29

### Added

-   Signing intializeSmartContract transactions.
-   Added menu for navigating between accounts, id cards, and settings (accessible by clicking Concordium logo).
-   Settings page to control individual settings, including visual settings (dark/light mode), network settings along with placeholder pages for settings to come at a later stage.
-   Add single credential functionality accessible from account page
-   Remove account (from local storage) from account page
-   An event is emitted when the JSON-RPC configuration is updated.
-   Navigation on the bottom of the account page to navigate between sections of the page.

### Changed

-   Access to initial setup page from account page has been removed.
-   Updated the event handling in the API to use EventEmitter.
-   Account selection is done through account list, which is accessible through the header when browsing the account section.
