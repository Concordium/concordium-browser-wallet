import { useTranslation } from 'react-i18next';
import React, { InputHTMLAttributes, useMemo, useState } from 'react';
import { passwordStrength } from 'check-password-strength';
import clsx from 'clsx';
import { Input } from '@popup/popupX/shared/Form/Input';
import Magnifying from '@assets/svgX/magnifying-glass.svg';
import { makeControlled } from '@popup/popupX/shared/Form/common/utils';
import { CommonFieldProps, RequiredControlledFieldProps } from '@popup/popupX/shared/Form/common/types';

type Props = Pick<InputHTMLAttributes<HTMLInputElement>, 'className' | 'autoFocus'> &
    RequiredControlledFieldProps &
    Omit<CommonFieldProps, 'note'>;

export function Search({ value, className, autoFocus, ...props }: Props) {
    return (
        <div className={clsx('form-search', className)}>
            <Magnifying />
            <Input placeholder="Search by name" {...props} autoFocus={autoFocus} />
        </div>
    );
}

const FormSearch = makeControlled(Search);
export default FormSearch;
