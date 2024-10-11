import React, { ReactNode } from 'react';
import clsx from 'clsx';
import { ClassName } from 'wallet-common-helpers';

function TextRoot({ children }: { children: ReactNode }) {
    return children;
}

function TextHeading({ children }: { children: ReactNode }) {
    return <span className="heading_medium">{children}</span>;
}

function TextMain({ children }: { children: ReactNode }) {
    return <span className="text__main">{children}</span>;
}

function TextMainRegular({ children }: { children: ReactNode }) {
    return <span className="text__main_regular">{children}</span>;
}
function TextMainMedium({ children }: { children: ReactNode }) {
    return <span className="text__main_medium">{children}</span>;
}

function TextCaptureMainSmall({ className, children }: { className?: string; children: ReactNode }) {
    return <span className={clsx('capture__main_small', className)}>{children}</span>;
}
function TextCaptureAdditionalSmall({ className, children }: { className?: string; children: ReactNode }) {
    return <span className={clsx('capture__additional_small', className)}>{children}</span>;
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

const Text = TextRoot as typeof TextRoot & {
    Heading: typeof TextHeading;
    Main: typeof TextMain;
    MainRegular: typeof TextMainRegular;
    MainMedium: typeof TextMainMedium;
    Capture: typeof TextCaptureMainSmall;
    CaptureAdditional: typeof TextCaptureAdditionalSmall;
    Label: typeof TextLabelMain;
    LabelRegular: typeof TextLabelRegular;
    ExternalLink: typeof TextExternalLink;
};
Text.Heading = TextHeading;
Text.Main = TextMain;
Text.MainRegular = TextMainRegular;
Text.MainMedium = TextMainMedium;
Text.Capture = TextCaptureMainSmall;
Text.CaptureAdditional = TextCaptureAdditionalSmall;
Text.Label = TextLabelMain;
Text.LabelRegular = TextLabelRegular;
Text.ExternalLink = TextExternalLink;

export default Text;
