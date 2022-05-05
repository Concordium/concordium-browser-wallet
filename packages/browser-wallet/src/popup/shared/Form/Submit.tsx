import React, { ComponentProps } from 'react';

/**
 * @description
 * Use as a regular \<button type="submit" /\>
 */
export default function Submit({ className, ...props }: Omit<ComponentProps<'button'>, 'type'>) {
    return <button className={className} {...props} type="submit" />;
}
