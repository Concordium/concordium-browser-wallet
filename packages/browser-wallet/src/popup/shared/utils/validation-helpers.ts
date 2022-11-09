import { Validate, ValidateResult } from 'react-hook-form';
import debounce from 'lodash.debounce';

export type AsyncValidate<V> = (fieldValue: V) => Promise<ValidateResult>;

export function debouncedAsyncValidate<V>(validator: AsyncValidate<V>, ms: number, leading = false): Validate<V> {
    return async (value) =>
        new Promise((resolve) => {
            debounce(
                async (v: V) => {
                    validator(v).then(resolve);
                },
                ms,
                { leading }
            )(value);
        });
}
