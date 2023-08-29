import { LaxNumberEnumValue } from '@concordium/browser-wallet-api-helpers/src/util';

enum Enum {
    One = 1,
    Two = 2,
}

function increment(arg: LaxNumberEnumValue<Enum>): Enum {
    return arg + 1;
}

test('LaxNumberEnumValue accepts constants', () => {
    expect(increment(1)).toEqual(2);
});

test('LaxNumberEnumValue accepts the enum values', () => {
    expect(increment(Enum.One)).toEqual(2);
});
