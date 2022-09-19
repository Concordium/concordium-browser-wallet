/* eslint-disable @typescript-eslint/no-var-requires */
const readline = require('readline');
const fs = require('fs');

/**
 * This script takes a file with generated license disclaimers (produced by
 * yarn licenses generate-disclaimer --production), and re-formats
 * it into a format using reStructuredText.
 */

const file = './disclaimer.txt';

function generateHeading(length, character) {
    return new Array(length + 1).join(character);
}

function writeHeading(text, out, character) {
    out.write(generateHeading(text.length, character));
    out.write(`\n${text}\n`);
    out.write(generateHeading(text.length, character));
}

const output = fs.createWriteStream('./disclaimer.rst', {
    flags: 'w',
});

const readInterface = readline.createInterface({
    input: fs.createReadStream(file),
    console: false,
});

const header = 'Concordium Browser Wallet Third Party Licenses';
writeHeading(header, output, '=');

readInterface.on('line', (line) => {
    if (line === '-----') {
        // Do nothing
    } else if (line === '') {
        output.write('\n');
    } else if (line.startsWith('The following software may be included in this product: ')) {
        let titleEndIndex;
        if (line.includes('A copy of the source code may be downloaded')) {
            titleEndIndex = line.indexOf('. A copy of the source code may be downloaded');
        } else {
            titleEndIndex = line.indexOf('. This software contains the following license and notice below');
        }

        const title = line.substring(56, titleEndIndex);
        writeHeading(title, output, '-');
        output.write('\n.. code-block:: console\n');
    } else if (
        line ===
        'THE FOLLOWING SETS FORTH ATTRIBUTION NOTICES FOR THIRD PARTY SOFTWARE THAT MAY BE CONTAINED IN PORTIONS OF THE CONCORDIUM BROWSER WALLET PRODUCT.'
    ) {
        output.write('\n');
        output.write(
            'The following sets forth attribution notices for third party software that may be contained in portions of the Concordium Browser Wallet product.'
        );
    } else {
        const lineWithNoSpacesAtEnd = line.replace(/\s*$/, '');
        if (lineWithNoSpacesAtEnd === '') {
            output.write('\n');
        } else {
            output.write(`   ${lineWithNoSpacesAtEnd}\n`);
        }
    }
});

readInterface.once('close', () => {
    fs.unlink(file, () => {});
});
