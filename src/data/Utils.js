
let virtualID = 0;

export function getVirtualID() {
    virtualID -= 1;
    return virtualID;
}

export function isVirtualItem(item) {
    return item && item.id < 0;
}

export function isRealItem(item) {
    return item && item.id > 0;
}

export function getPartialItem(item) {
    return item ? { __type__: item.__type__, id: item.id, name: item.name } : null;
}

export function awaitSequence(items, method) {
    if (!items) {
        return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
        let index = 0;
        const results = [];
        const next = () => {
            if (index === items.length) {
                resolve(results);
            } else {
                method(items[index], index, items)
                    .then((result) => {
                        results.push(result);
                        index += 1;
                        next();
                    })
                    .catch((error) => reject(error));
            }
        };
        next();
    });
}

export function getCallbackAndPromise() {
    let resolve; let
        reject;
    const promise = new Promise((resolveFn, rejectFn) => {
        resolve = resolveFn;
        reject = rejectFn;
    });
    const callback = (error, result) => {
        if (error) {
            reject(error);
        } else {
            resolve(result);
        }
    };
    return [callback, promise];
}
