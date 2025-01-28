import React, { Children, useMemo, useState } from 'react';
import clsx from 'clsx';
import { AnimatePresence, motion } from 'framer-motion';
import Button from '@popup/popupX/shared/Button';
import ArrowRight from '@assets/svgX/arrow-right.svg';

type Direction = 'next' | 'prev';

type CarouselProps = {
    children: React.ReactNode;
    /** Function to be called when the carousel is finished */
    onDone: () => void;
};

export default function Carousel({ children, onDone }: CarouselProps) {
    const [[active], setActive] = useState<[number, Direction]>([0, 'next']);
    const pages = useMemo(() => Children.toArray(children), [children]);
    if (!pages) {
        return null;
    }

    const isLast = active === pages.length - 1;
    return (
        <div className="info-carousel-container">
            <div className="info-carousel__content">
                <AnimatePresence>
                    <motion.div className="info-carousel__page">{pages[active]}</motion.div>
                </AnimatePresence>
            </div>
            <div className="info-carousel__controls">
                <Button.Text label="Skip" onClick={onDone} />
                <div className="info-carousel__controls_dots">
                    {pages.map((_, i) => (
                        <Button.Text
                            // eslint-disable-next-line react/no-array-index-key
                            key={i}
                            className={clsx('dot', active === i && 'dot--active')}
                            onClick={() => setActive(([a]) => [i, i > a ? 'next' : 'prev'])}
                            label=""
                        />
                    ))}
                </div>
                {isLast && <Button.IconText label="Continue" icon={<ArrowRight />} leftLabel onClick={onDone} />}
                {!isLast && (
                    <Button.IconText
                        label="Next"
                        icon={<ArrowRight />}
                        leftLabel
                        onClick={() => setActive([active + 1, 'next'])}
                    />
                )}
            </div>
        </div>
    );
}
