import React, { ComponentProps } from 'react';
import Button from '@popup/shared/Button/Button';

/**
 * @description
 * Use as a regular \<button type="submit" /\>
 */
export default function Submit({
    className,
    ...props
}: Omit<ComponentProps<typeof Button>, 'type' | 'as' | 'clear' | 'faded'>) {
    return <Button className={className} {...props} type="submit" />;
}
