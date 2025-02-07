import React, { ReactNode } from 'react';
import clsx from 'clsx';
import { ClassName } from 'wallet-common-helpers';

import Text from '@popup/popupX/shared/Text';

function PageRoot({ className, children }: { className?: string; children: ReactNode }) {
    return <div className={clsx('page-container', className)}>{children}</div>;
}

function PageTop({ heading, children }: { heading?: ReactNode; children?: ReactNode }) {
    return (
        <div className="page__top">
            {heading && <Text.Heading>{heading}</Text.Heading>}
            {children && <div className="page__top_side">{children}</div>}
        </div>
    );
}

function PageMain({ children, className }: { children: ReactNode } & ClassName) {
    return <div className={clsx('page__main', className)}>{children}</div>;
}

function PageFooter({ children }: { children: ReactNode }) {
    return <div className="page__footer">{children}</div>;
}

const Page = PageRoot as typeof PageRoot & {
    Top: typeof PageTop;
    Main: typeof PageMain;
    Footer: typeof PageFooter;
};
Page.Top = PageTop;
Page.Main = PageMain;
Page.Footer = PageFooter;

export default Page;
