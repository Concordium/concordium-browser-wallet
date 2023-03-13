import { buildConfirmState } from '@popup/pages/Account/SendCcd/util';

test('createTransfer buildConfirmState can handle a token value > 64 bit', () => {
    const values = {
        amount: '9224',
        recipient: '4inf4g36xDEQmjxDbbkqeHD2HNg9v7dohXUDH5S9en4Th53kxm',
        executionEnergy: '0',
        cost: '0',
        token: {
            contractIndex: '0',
            tokenId: '0',
            metadata: {
                decimals: 18,
            },
        },
    };
    expect(() => buildConfirmState(values)).not.toThrow();
});
