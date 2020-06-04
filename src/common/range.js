
function range(start, end, step) {
    if (typeof end === 'undefined') {
        // eslint-disable-next-line no-param-reassign
        end = start;
        // eslint-disable-next-line no-param-reassign
        start = 0;
    }
    if (typeof step === 'undefined') {
        // eslint-disable-next-line no-param-reassign
        step = 1;
    }
    const result = [];
    for (let ii = start; ii < end; ii += step) {
        result.push(ii);
    }
    return result;
}

export default range;
