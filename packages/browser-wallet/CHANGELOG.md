# Changelog

## Unreleased

### Added

-   Signing intializeSmartContract transactions.
-   Added menu for navigating between accounts, id cards, and settings (accessible by clicking Concordium logo).
-   Settings page to control individual settings, including visual settings (dark/light mode), network settings along with placeholder pages for settings to come at a later stage.
-   Add single credential functionality accessible from account page
-   Remove account (from local storage) from account page
-   An event is emitted when the JSON-RPC configuration is updated.

### Changed

-   Access to initial setup page from account page has been removed.
-   Updated the event handling in the API to use EventEmitter.
