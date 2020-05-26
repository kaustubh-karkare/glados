
function deepcopy(item) {
    return JSON.parse(JSON.stringify(item));
}

export default deepcopy;
