import { validateTransferAmount } from '../src/popup/shared/utils/transaction-helpers';
import en from '../src/popup/shared/i18n/en';

test('validateTransfer amount respects decimals parameter', () => {
    const invalidMessage = en.utils.ccdAmount.invalid;
    expect(validateTransferAmount('1000', undefined, 0)).toBe(undefined);
    expect(validateTransferAmount('1000.1', undefined, 0)).toContain(invalidMessage);
    expect(validateTransferAmount('1000.001', undefined, 3)).toBe(undefined);
    expect(validateTransferAmount('1000.0001', undefined, 3)).toContain(invalidMessage);
    expect(validateTransferAmount('1000.000001', undefined, 6)).toBe(undefined);
    expect(validateTransferAmount('1000.0000001', undefined, 6)).toContain(invalidMessage);
    expect(validateTransferAmount('1000.000000000000000001', undefined, 18)).toBe(undefined);
    expect(validateTransferAmount('1000.0000000000000000001', undefined, 18)).toContain(invalidMessage);
});

test('validateTransfer does not allow letters in string', () => {
    const invalidMessage = en.utils.ccdAmount.invalid;
    expect(validateTransferAmount('a', undefined, 0)).toContain(invalidMessage);
    expect(validateTransferAmount('1n', undefined, 0)).toContain(invalidMessage);
    expect(validateTransferAmount('O1', undefined, 0)).toContain(invalidMessage);
    expect(validateTransferAmount('5a2', undefined, 0)).toContain(invalidMessage);
    expect(validateTransferAmount('test', undefined, 0)).toContain(invalidMessage);
});
