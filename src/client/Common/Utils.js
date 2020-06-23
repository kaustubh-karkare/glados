function combineClassNames(map) {
    return Object.entries(map)
        .filter((pair) => pair[1])
        .map((pair) => pair[0])
        .join(' ');
}

// https://davidwalsh.name/javascript-debounce-function
function debounce(func, wait, immediate) {
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

// eslint-disable-next-line import/prefer-default-export
export { combineClassNames, debounce };
