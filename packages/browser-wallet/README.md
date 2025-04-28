# Browser wallet

This directory contains the code for the chrome extension used to interact with the concordium blockchain.

## Installing

See [installing](../../README.md#installing) in repository root.

## Building and development

Assuming dependencies have been successfully installed,

-   `cd` into package root
-   Build concordium helpers by running `yarn build:api-helpers`
-   Run `yarn build:(dev|prod)` (Note these are global commands and can be run from anywhere in the repository)
-   To continuously watch for changes, run `yarn watch`

Note: `yarn build:dev` builds the browser wallet with access to stagenet, concordium's internal chain for testing, and with debug data,
while `yarn build:prod` builds the release version, where only mainnet and testnet can be chosen and with bebug information stripped away.

When the extension has been successfully built,

-   Load extension (`dist` folder in package root) folder [into chrome](https://developer.chrome.com/docs/extensions/mv3/getstarted/#unpacked)

### Storybook

Storybook is used to document the component library.

-   To run storybook, execute `yarn storybook` in a terminal.
-   Open `http://localhost:6006` in a browser.
