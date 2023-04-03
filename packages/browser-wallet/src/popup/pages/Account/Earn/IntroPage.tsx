import React, { PropsWithChildren } from 'react';

type IntroPageProps = PropsWithChildren<{
    title: string;
}>;

export default function IntroPage({ title, children }: IntroPageProps) {
    return (
        <>
            <h3 className="text-center m-t-0">{title}</h3>
            {children}
        </>
    );
}
