# Browser wallet

This directory contains the code for the chrome extension used to interact with the concordium blockchain.

## Installing

See [installing](../../README.md#installing) in repository root.

## Building and development

Assuming dependencies have been successfully installed,

-   `cd` into package root
-   Build concordium helpers by running `yarn build:api-helpers`
-   Run `yarn build:(dev|prod)`
-   To continuously watch for changes, run `yarn watch`

When the extension has been successfully built,

-   Load extension (`dist` folder in package root) folder [into chrome](https://developer.chrome.com/docs/extensions/mv3/getstarted/#unpacked)

### Storybook

Storybook is used to document the component library.

-   To run storybook, execute `yarn storybook` in a terminal.
-   Open `http://localhost:6006` in a browser.
