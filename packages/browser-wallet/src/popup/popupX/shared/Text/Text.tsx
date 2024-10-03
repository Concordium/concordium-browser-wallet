import React, { ReactNode } from 'react';
import clsx from 'clsx';

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

const Text = TextRoot as typeof TextRoot & {
    Heading: typeof TextHeading;
    Main: typeof TextMain;
    MainRegular: typeof TextMainRegular;
    MainMedium: typeof TextMainMedium;
    Capture: typeof TextCaptureMainSmall;
    CaptureAdditional: typeof TextCaptureAdditionalSmall;
    Label: typeof TextLabelMain;
};
Text.Heading = TextHeading;
Text.Main = TextMain;
Text.MainRegular = TextMainRegular;
Text.MainMedium = TextMainMedium;
Text.Capture = TextCaptureMainSmall;
Text.CaptureAdditional = TextCaptureAdditionalSmall;
Text.Label = TextLabelMain;

export default Text;
