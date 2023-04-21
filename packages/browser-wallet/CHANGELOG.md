# Changelog

## 1.0.1

### Added

-   SendTransaction now validates that an account has sufficient funds before sending a transaction (requested though the api).
-   Support for eID (Criipto) identity document types.

### Changed

-   Improved readability of events in transaction details.
-   When choosing baker stake amount, the minimumEquityCapital is no longer the default value for non bakers.
-   Baker transactions no longer display a minimum of 3 decimals when confirming the transaction.
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
