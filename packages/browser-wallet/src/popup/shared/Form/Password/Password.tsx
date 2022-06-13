import React, { InputHTMLAttributes, useMemo, useState } from 'react';
import { passwordStrength } from 'check-password-strength';
import { Normalize, useTranslation } from 'react-i18next';

import HiddenIcon from '@shared/assets/svg/hidden.svg';
import VisibleIcon from '@shared/assets/svg/visible.svg';
import { Input } from '../Input';
import { makeControlled } from '../common/utils';
import { CommonFieldProps, RequiredControlledFieldProps } from '../common/types';
import en from '../../i18n/en';

const strengthTexts: Normalize<typeof en>[] = [
    'form.password.tooWeak',
    'form.password.weak',
    'form.password.medium',
    'form.password.strong',
];

type Props = Pick<InputHTMLAttributes<HTMLInputElement>, 'className'> &
    RequiredControlledFieldProps &
    CommonFieldProps & {
        /**
         * Shows strength of the password under the input field.
         */
        showStrength?: boolean;
    };

/**
 * @description
 * Password input with reveal button and optional strength check.
 */
export function Password({ showStrength = false, value, ...props }: Props) {
    const { t } = useTranslation();
    const [reveal, setReveal] = useState(false);

    const strength = useMemo(
        () => (value && showStrength ? passwordStrength(value).id : undefined),
        [showStrength, value]
    );
    const strengthNote = useMemo(() => (strength !== undefined ? t(strengthTexts[strength]) : undefined), [strength]);

    return (
        <div className="form-password">
            <Input {...props} type={reveal ? 'text' : 'password'} note={strengthNote as string} />
            <button className="form-password__reveal" type="button" onClick={() => setReveal(!reveal)}>
                {reveal ? <VisibleIcon /> : <HiddenIcon />}
            </button>
        </div>
    );
}

const FormPassword = makeControlled(Password);
export default FormPassword;
