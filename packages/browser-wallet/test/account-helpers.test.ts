import { getNextUnused } from '@shared/utils/number-helpers';

test('getNextUnused on no gap', () => {
    expect(getNextUnused([1, 0, 2, 3])).toEqual(4);
});

test('getNextUnused on no 0', () => {
    expect(getNextUnused([1, 2, 3])).toEqual(0);
});

test('getNextUnused with gaps', () => {
    expect(getNextUnused([0, 100, 2, 3])).toEqual(1);
});

test('getNextUnused with gaps and no 0', () => {
    expect(getNextUnused([0, 100, 2, 3])).toEqual(1);
});
