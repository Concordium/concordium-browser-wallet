/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { ElementType, PropsWithChildren, Ref } from 'react';
import { ClassName, PolymorphicComponentProps } from '../utils/types';
import { useDetectClickOutside } from '../utils/eventHooks';

interface Props extends ClassName {
    /**
     * Handler for clicks outside component.
     */
    onClickOutside(): void;
}

type DetectClickOutsideProps<C extends ElementType> = PolymorphicComponentProps<C, Props>;

/**
 * @description
 * Detects clicks outside element defined by component.
 *
 * @example
 * <DetectClickOutside onClickOutside={handleClickOutside}>
 *   ...
 * </DetectClickOutside>
 */
export default function DetectClickOutside<C extends ElementType<{ ref?: Ref<any> }> = 'div'>({
    onClickOutside,
    as,
    ...props
}: PropsWithChildren<DetectClickOutsideProps<C>>): JSX.Element {
    const ref = useDetectClickOutside(onClickOutside);
    const Element = (as || 'div') as any;

    return <Element ref={ref} {...props} />;
}
