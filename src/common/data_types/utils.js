let virtualID = 0;

export function getVirtualID() {
    virtualID -= 1;
    return virtualID;
}

export function isItem(item) {
    return item && typeof item.__id__ === 'number';
}

export function isVirtualItem(item) {
    return item && item.__id__ < 0;
}

export function isRealItem(item) {
    return item && item.__id__ > 0;
}

export function getPartialItem(item) {
    return item ? { __type__: item.__type__, __id__: item.__id__, name: item.name } : null;
}
