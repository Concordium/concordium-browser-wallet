import React, { ReactNode } from 'react';

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

function TextCaptureMainSmall({ children }: { children: ReactNode }) {
    return <span className="capture__main_small">{children}</span>;
}

function TextLabelMain({ children }: { children: ReactNode }) {
    return <span className="label__main">{children}</span>;
}

const Text = TextRoot as typeof TextRoot & {
    Heading: typeof TextHeading;
    Main: typeof TextMain;
    MainRegular: typeof TextMainRegular;
    MainMedium: typeof TextMainMedium;
    Capture: typeof TextCaptureMainSmall;
    Label: typeof TextLabelMain;
};
Text.Heading = TextHeading;
Text.Main = TextMain;
Text.MainRegular = TextMainRegular;
Text.MainMedium = TextMainMedium;
Text.Capture = TextCaptureMainSmall;
Text.Label = TextLabelMain;

export default Text;