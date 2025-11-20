/* eslint-disable jsx-a11y/tabindex-no-positive */
import React, { InputHTMLAttributes, useMemo, useState } from 'react';
import { passwordStrength } from 'check-password-strength';
import { Normalize, useTranslation } from 'react-i18next';

import HiddenIcon from '@assets/svgX/UiKit/Interface/eye-closed-show.svg';
import VisibleIcon from '@assets/svgX/UiKit/Interface/eye-open-hide.svg';
import Exclamation from '@assets/svgX/UiKit/Interface/circled-warning-exclamation.svg';
import clsx from 'clsx';
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

type Props = Pick<InputHTMLAttributes<HTMLInputElement>, 'className' | 'autoFocus'> &
    RequiredControlledFieldProps &
    Omit<CommonFieldProps, 'note'> & {
        /**
         * Shows strength of the password under the input field.
         */
        showStrength?: boolean;
    };

/**
 * @description
 * Password input with reveal button and optional strength check.
 */
export function Password({ showStrength = false, value, className, autoFocus, ...props }: Props) {
    const { t } = useTranslation('x', { keyPrefix: 'sharedX' });
    const [reveal, setReveal] = useState(false);

    const strength = useMemo(
        () => (value && showStrength ? passwordStrength(value).id : undefined),
        [showStrength, value]
    );
    const strengthNote = useMemo(
        () =>
            strength !== undefined ? (
                <>
                    <Exclamation />
                    {t(strengthTexts[strength]) as string}
                </>
            ) : undefined,
        [strength]
    );

    return (
        <div className={clsx('form-password', className)}>
            <Input {...props} type={reveal ? 'text' : 'password'} note={strengthNote} autoFocus={autoFocus} />
            <button className="form-password__reveal" type="button" tabIndex={1} onClick={() => setReveal(!reveal)}>
                {reveal ? <VisibleIcon /> : <HiddenIcon />}
            </button>
        </div>
    );
}

const FormPassword = makeControlled(Password);
export default FormPassword;
