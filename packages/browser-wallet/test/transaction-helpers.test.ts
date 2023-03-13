import { validateTransferAmount } from '../src/popup/shared/utils/transaction-helpers';

test('validateTransfer amount respects decimals parameter', () => {
    expect(validateTransferAmount('1000', undefined, 0)).toBe(undefined);
    expect(validateTransferAmount('1000.1', undefined, 0)).toContain('not a valid');
    expect(validateTransferAmount('1000.001', undefined, 3)).toBe(undefined);
    expect(validateTransferAmount('1000.0001', undefined, 3)).toContain('not a valid');
    expect(validateTransferAmount('1000.000001', undefined, 6)).toBe(undefined);
    expect(validateTransferAmount('1000.0000001', undefined, 6)).toContain('not a valid');
    expect(validateTransferAmount('1000.000000000000000001', undefined, 18)).toBe(undefined);
    expect(validateTransferAmount('1000.0000000000000000001', undefined, 18)).toContain('not a valid');
});
