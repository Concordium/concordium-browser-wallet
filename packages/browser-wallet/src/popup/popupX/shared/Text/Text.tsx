import React, { ReactNode, useEffect, useRef } from 'react';
import clsx from 'clsx';
import { ClassName, ClassNameAndStyle } from 'wallet-common-helpers';

function TextRoot({ children }: { children: ReactNode }) {
    return children;
}

function TextHeading({ children, className, style }: { children: ReactNode } & ClassNameAndStyle) {
    return (
        <span className={clsx('heading_medium', className)} style={style}>
            {children}
        </span>
    );
}

function TextHeadingLarge({ children }: { children: ReactNode }) {
    return <span className="heading_large">{children}</span>;
}

function TextHeadingBig({ children }: { children: ReactNode }) {
    return <span className="heading_big">{children}</span>;
}

function TextMain({ children }: { children: ReactNode }) {
    return <span className="text__main">{children}</span>;
}

function TextMainRegular({ children }: { children: ReactNode }) {
    return <span className="text__main_regular">{children}</span>;
}
function TextMainMedium({ children, className }: { className?: string; children: ReactNode }) {
    return <span className={clsx('text__main_medium', className)}>{children}</span>;
}
function TextAdditionalSmall({ className, children }: { className?: string; children: ReactNode }) {
    return <span className={clsx('text__additional_small', className)}>{children}</span>;
}

function TextCaptureMainSmall({ className, children }: { className?: string; children: ReactNode }) {
    return <span className={clsx('capture__main_small', className)}>{children}</span>;
}
function TextCaptureAdditionalSmall({ className, children, style }: { children: ReactNode } & ClassNameAndStyle) {
    return (
        <span className={clsx('capture__additional_small', className)} style={style}>
            {children}
        </span>
    );
}

function TextLabelMain({ className, children }: { className?: string; children: ReactNode }) {
    return <span className={clsx('label__main', className)}>{children}</span>;
}

function TextLabelRegular({ className, children }: { className?: string; children: ReactNode }) {
    return <span className={clsx('label__regular', className)}>{children}</span>;
}

type Props = ClassName & { path: string; children?: string | ReactNode };

function TextExternalLink({ path, children = path, className }: Props) {
    return (
        <a className={clsx('external-link', className)} href={`${path}`} target="_blank" rel="noreferrer">
            {children}
        </a>
    );
}

function TextDynamicSize({
    baseFontSize,
    baseTextLength,
    className,
    children,
}: {
    baseFontSize: number;
    baseTextLength: number;
    className?: string;
    children: ReactNode;
}) {
    const ref = useRef<HTMLDivElement | null>(null);
    const getFontSize = (textContent: number) => {
        const fontSize = baseFontSize * (baseTextLength / Math.max(baseTextLength, textContent));
        return `${fontSize}px`;
    };

    useEffect(() => {
        if (ref.current) {
            ref.current.style.fontSize = getFontSize(ref.current.textContent?.length || 0);
        }
    }, [ref, children]);

    return (
        <span ref={ref} className={clsx('dynamic-size', className)}>
            {children}
        </span>
    );
}

const Text = TextRoot as typeof TextRoot & {
    HeadingLarge: typeof TextHeadingLarge;
    HeadingBig: typeof TextHeadingBig;
    Heading: typeof TextHeading;
    Main: typeof TextMain;
    MainRegular: typeof TextMainRegular;
    MainMedium: typeof TextMainMedium;
    AdditionalSmall: typeof TextAdditionalSmall;
    Capture: typeof TextCaptureMainSmall;
    CaptureAdditional: typeof TextCaptureAdditionalSmall;
    Label: typeof TextLabelMain;
    LabelRegular: typeof TextLabelRegular;
    ExternalLink: typeof TextExternalLink;
    DynamicSize: typeof TextDynamicSize;
};
Text.HeadingLarge = TextHeadingLarge;
Text.HeadingBig = TextHeadingBig;
Text.Heading = TextHeading;
Text.Main = TextMain;
Text.MainRegular = TextMainRegular;
Text.MainMedium = TextMainMedium;
Text.AdditionalSmall = TextAdditionalSmall;
Text.Capture = TextCaptureMainSmall;
Text.CaptureAdditional = TextCaptureAdditionalSmall;
Text.Label = TextLabelMain;
Text.LabelRegular = TextLabelRegular;
Text.ExternalLink = TextExternalLink;
Text.DynamicSize = TextDynamicSize;

export default Text;
