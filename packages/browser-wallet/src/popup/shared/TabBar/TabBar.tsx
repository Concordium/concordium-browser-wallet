import clsx from 'clsx';
import React, {
    ElementType,
    forwardRef,
    ForwardRefExoticComponent,
    PropsWithChildren,
    PropsWithoutRef,
    RefAttributes,
} from 'react';
import { NavLink } from 'react-router-dom';
import { ClassName, PolymorphicComponentProps } from 'wallet-common-helpers';

type ItemProps<A extends ElementType = typeof NavLink> = PolymorphicComponentProps<A, ClassName>;

function TabBarItem<A extends ElementType = typeof NavLink>({ as, className, ...props }: ItemProps<A>) {
    const Component = as || NavLink;

    return <Component to="" {...props} className={clsx('tab-bar-item', className)} />;
}

type Props = PropsWithChildren<ClassName>;

const TabBar = forwardRef<HTMLDivElement, Props>(({ children, className }, ref) => {
    return (
        <div className={clsx('tab-bar', className)} ref={ref}>
            {children}
        </div>
    );
}) as ForwardRefExoticComponent<PropsWithoutRef<Props> & RefAttributes<HTMLDivElement>> & { Item: typeof TabBarItem };

TabBar.Item = TabBarItem;

export default TabBar;
