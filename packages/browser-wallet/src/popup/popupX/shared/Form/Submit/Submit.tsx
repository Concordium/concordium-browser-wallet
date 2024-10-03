import React, { ComponentProps } from 'react';
import Button from '@popup/popupX/shared/Button';

/**
 * @description
 * Use as a regular \<button type="submit" /\>
 */
export default function Submit({
    ...props
}: Omit<ComponentProps<typeof Button.Main>, 'type' | 'as' | 'clear' | 'faded'>) {
    return <Button.Main {...props} type="submit" />;
}
