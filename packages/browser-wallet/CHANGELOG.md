# Changelog

## Unreleased

### Added

-   Login screen.

### Changed

-   The network connections page has been updated with new UI.

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
