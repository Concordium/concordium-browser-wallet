import clsx from 'clsx';
import { AnimatePresence, motion, Variants } from 'framer-motion';
import React, { Children, ReactNode, useMemo, useState } from 'react';
import { ClassName } from 'wallet-common-helpers';

import { defaultTransition } from '@shared/constants/transition';
import Button from '../Button';
import ButtonGroup from '../ButtonGroup';

type Direction = 'next' | 'prev';

const transitionVariants: Variants = {
    enter: (direction: Direction) => ({ x: direction === 'next' ? '50%' : '-50%', opacity: 0 }),
    active: { x: 0, opacity: 1 },
    exit: (direction: Direction) => ({ x: direction === 'next' ? '-50%' : '50%', opacity: 0 }),
};

type Props = ClassName & {
    /**
     * Action called when either "skip" or "continue" button is pressed
     */
    onContinue(): void;
    children: ReactNode | ReactNode[];
};

/**
 * Carousel component for presenting single or multiple pages (passed as children) with information.
 *
 * @example
 *  <Carousel onContinue={() => navigate('/route/to/next')}>
 *      <div>First page...</div>
 *      <div>Second page...</div>
 *  </Carousel>
 */
export default function Carousel({ className, children, onContinue }: Props) {
    const [[active, direction], setActive] = useState<[number, Direction]>([0, 'next']);

    const pages = useMemo(() => Children.toArray(children), [children]);

    if (!pages?.length) {
        return null;
    }

    const isLastPage = active === pages.length - 1;

    return (
        <div className={clsx('carousel', className)}>
            <div className="carousel__content">
                <AnimatePresence initial={false} custom={direction}>
                    <motion.div
                        key={active}
                        variants={transitionVariants}
                        custom={direction}
                        initial="enter"
                        animate="active"
                        exit="exit"
                        transition={defaultTransition}
                        className="carousel__page"
                    >
                        {pages[active]}
                    </motion.div>
                </AnimatePresence>
            </div>
            <div className="carousel__divider" />
            <div className="carousel__dots">
                {pages.length > 1 &&
                    pages.map((_, i) => (
                        <Button
                            // eslint-disable-next-line react/no-array-index-key
                            key={i}
                            className={clsx('carousel__dot', active === i && 'carousel__dot--active')}
                            clear
                            onClick={() => setActive(([a]) => [i, i > a ? 'next' : 'prev'])}
                        />
                    ))}
            </div>

            {pages.length > 1 ? (
                <ButtonGroup className="carousel__actions">
                    {active === 0 ? (
                        <Button faded onClick={onContinue}>
                            Skip
                        </Button>
                    ) : (
                        <Button faded={isLastPage} onClick={() => setActive(([a]) => [a - 1, 'prev'])}>
                            Back
                        </Button>
                    )}
                    {isLastPage ? (
                        <Button onClick={onContinue}>Continue</Button>
                    ) : (
                        <Button onClick={() => setActive(([a]) => [a + 1, 'next'])}>Next</Button>
                    )}
                </ButtonGroup>
            ) : (
                <Button onClick={onContinue} width="medium">
                    Continue
                </Button>
            )}
        </div>
    );
}
