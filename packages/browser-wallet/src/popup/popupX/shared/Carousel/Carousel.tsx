import React, { Children, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Button from '@popup/popupX/shared/Button';
import clsx from 'clsx';

type Direction = 'next' | 'prev';

export default function Carousel({ children }: { children: React.ReactNode }) {
    const [[active], setActive] = useState<[number, Direction]>([0, 'next']);
    const pages = useMemo(() => Children.toArray(children), [children]);
    if (!pages) {
        return null;
    }
    return (
        <div className="info-carousel-container">
            <div className="info-carousel__content">
                <AnimatePresence>
                    <motion.div className="info-carousel__page">{pages[active]}</motion.div>
                </AnimatePresence>
            </div>
            <div className="info-carousel__controls">
                <div>Skip</div>
                <div className="info-carousel__controls_dots">
                    {pages.map((_, i) => (
                        <Button.Main
                            // eslint-disable-next-line react/no-array-index-key
                            key={i}
                            className={clsx('dot', active === i && 'dot--active')}
                            onClick={() => setActive(([a]) => [i, i > a ? 'next' : 'prev'])}
                            label=""
                        />
                    ))}
                </div>
                <div>{'Next ->'}</div>
            </div>
        </div>
    );
}
