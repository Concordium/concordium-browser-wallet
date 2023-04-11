import { buildConfirmState, ConfirmTokenTransferState } from '../src/popup/pages/Account/SendCcd/util';

test('buildConfirmState converts input to ConfirmTokenTransferState state if token is defined', () => {
    const metadata = {
        decimals: 3,
    };
    const values = {
        amount: '9224.000',
        recipient: '4inf4g36xDEQmjxDbbkqeHD2HNg9v7dohXUDH5S9en4Th53kxm',
        executionEnergy: '0',
        cost: '0',
        token: {
            contractIndex: '0',
            tokenId: '0',
            metadata,
        },
    };
    const state = buildConfirmState(values) as ConfirmTokenTransferState;
    expect(state.amount).toBe(9224000n);
    expect(state.toAddress).toBe('4inf4g36xDEQmjxDbbkqeHD2HNg9v7dohXUDH5S9en4Th53kxm');
    expect(state.contractIndex).toBe('0');
    expect(state.executionEnergy).toBe('0');
    expect(state.tokenId).toBe('0');
    expect(state.metadata).toEqual(metadata);
});

test('buildConfirmState can handle a token amount > 64 bit', () => {
    const values = {
        amount: '9224000000000000000000',
        recipient: '4inf4g36xDEQmjxDbbkqeHD2HNg9v7dohXUDH5S9en4Th53kxm',
        executionEnergy: '0',
        cost: '0',
        token: {
            contractIndex: '0',
            tokenId: '0',
            metadata: {},
        },
    };
    expect(() => buildConfirmState(values)).not.toThrow();
    const state = buildConfirmState(values);
    expect(state.amount).toBe(9224000000000000000000n);
});

test('buildConfirmState can handle a token amount > 64 bit (from decimal conversion) ', () => {
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
    const state = buildConfirmState(values);
    expect(state.amount).toBe(9224000000000000000000n);
});

test('buildConfirmState can handle a token value of max unsigned 256 bit integer', () => {
    const values = {
        amount: '115792089237316195423570985008687907853269984665640564039457584007913129639935',
        recipient: '4inf4g36xDEQmjxDbbkqeHD2HNg9v7dohXUDH5S9en4Th53kxm',
        executionEnergy: '0',
        cost: '0',
        token: {
            contractIndex: '0',
            tokenId: '0',
            metadata: {
                decimals: 0,
            },
        },
    };
    expect(() => buildConfirmState(values)).not.toThrow();
});
