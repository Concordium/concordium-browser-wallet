# Changelog

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
