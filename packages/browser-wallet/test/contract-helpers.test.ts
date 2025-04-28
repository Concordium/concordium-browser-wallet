import { applyExecutionNRGBuffer } from '../src/shared/utils/contract-helpers';

test('NRG buffer added is 20 percent', () => {
    const estimatedExecutionEnergy = 500n;
    expect(applyExecutionNRGBuffer(estimatedExecutionEnergy)).toEqual(600n);
});

test('NRG buffer returns 0 for 0 input', () => {
    const estimatedExecutionEnergy = 0n;
    expect(applyExecutionNRGBuffer(estimatedExecutionEnergy)).toEqual(0n);
});
