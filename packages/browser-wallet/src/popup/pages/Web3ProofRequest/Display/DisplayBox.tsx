import Button from '@popup/shared/Button';
import Modal from '@popup/shared/Modal';
import clsx from 'clsx';
import React, { ReactNode, useState } from 'react';
import { ClassName } from 'wallet-common-helpers';
import InfoTooltipIcon from '@assets/svg/help.svg';

type DisplayBoxProps = ClassName & {
    header: string;
    children: ReactNode;
    infoBox: ReactNode;
};

export function DisplayBox({ className, children, header, infoBox }: DisplayBoxProps) {
    const [open, setOpen] = useState(false);

    return (
        <section className={clsx('display-box', className)}>
            <header className="display-box__header">
                <div className="display6">{header}</div>
                <Modal
                    disableClose
                    middle
                    open={open}
                    onOpen={() => setOpen(true)}
                    onClose={() => setOpen(false)}
                    trigger={
                        <Button clear className="flex display-box__tooltip-button">
                            <InfoTooltipIcon className="display-box__tooltip-icon" />
                        </Button>
                    }
                >
                    {infoBox}
                    <Button className="new-button-styling w-full" width="wide" onClick={() => setOpen(false)}>
                        Ok
                    </Button>
                </Modal>
            </header>
            {children}
        </section>
    );
}
