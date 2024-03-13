import { EU_MEMBERS } from '@concordium/web-sdk';
import { isEuCountrySet } from '../src/popup/pages/IdProofRequest/DisplayStatement/utils';

test('not eu country set if only one country in set', () => {
    const countries = 'DK,DK,DK,DK,DK,DK,DK,DK,DK,DK,DK,DK,DK,DK,DK,DK,DK,DK,DK,DK,DK,DK,DK,DK,DK,DK,DK'.split(',');

    const isEu = isEuCountrySet(countries);

    expect(isEu).toBeFalsy();
});

test('eu country set returns true when checking if eu country set', () => {
    const isEu = isEuCountrySet(EU_MEMBERS);

    expect(isEu).toBeTruthy();
});
