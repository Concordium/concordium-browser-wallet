/* eslint-disable no-param-reassign */

export function scaleFieldWidth(el: HTMLElement | null) {
    if (!el) {
        return;
    }

    setTimeout(() => {
        el.style.width = '5px';
        el.style.width = `${el.scrollWidth + 1}px`;
    }, 0);
}

export function scaleFieldHeight(el: HTMLElement | null) {
    if (!el) {
        return;
    }

    setTimeout(() => {
        el.style.height = '5px';
        el.style.height = `${el.scrollHeight}px`;
    }, 0);
}
