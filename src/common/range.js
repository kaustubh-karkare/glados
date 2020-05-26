
function range(start, end, step) {
    if (typeof end == 'undefined') {
        end = start;
        start = 0;
    }
    if (typeof step == 'undefined') {
        step = 1;
    }
    const result = [];
    for (let ii = start; ii < end; ii += step) {
        result.push(ii);
    }
    return result;
}

export default range;
