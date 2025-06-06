import React, { InputHTMLAttributes } from 'react';
import clsx from 'clsx';
import { Input } from '@popup/popupX/shared/Form/Input';
import Magnifying from '@assets/svgX/magnifying-glass.svg';
import { makeControlled } from '@popup/popupX/shared/Form/common/utils';
import { CommonFieldProps, RequiredControlledFieldProps } from '@popup/popupX/shared/Form/common/types';

type Props = Pick<InputHTMLAttributes<HTMLInputElement>, 'className' | 'autoFocus' | 'placeholder'> &
    RequiredControlledFieldProps &
    Omit<CommonFieldProps, 'note'>;

export function Search({ className, autoFocus, ...props }: Props) {
    return (
        <div className={clsx('form-search', className)}>
            <Magnifying />
            <Input {...props} autoFocus={autoFocus} />
        </div>
    );
}

const FormSearch = makeControlled(Search);
export default FormSearch;
