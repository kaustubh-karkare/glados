
export function suppressUnlessShiftKey(event) {
    if (!event.shiftKey) {
        event.preventDefault();
    }
}

// https://davidwalsh.name/javascript-debounce-function
export function debounce(func, wait, immediate) {
    let timeout;
    return function inner(...args) {
        const context = this;
        const later = () => {
            timeout = null;
            if (!immediate) func.apply(context, args);
        };
        const callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) func.apply(context, args);
    };
}

export const KeyCodes = {
    DELETE: 8,
    ENTER: 13,
    ESCAPE: 27,
    SPACE: 32,
    UP_ARROW: 38,
    DOWN_ARROW: 40,
};
