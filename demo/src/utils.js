function awaitSequence(items, method) {
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

function wait(milliseconds = 250) {
    return new Promise((resolve) => {
        setTimeout(resolve, milliseconds);
    });
}

function waitUntil(conditionMethod, intervalMs = 50, timeoutMs = 5000) {
    let elapsedMs = -intervalMs;
    return new Promise((resolve, reject) => {
        const timeout = setInterval(() => {
            Promise.resolve(conditionMethod()).then((isDone) => {
                if (isDone) {
                    clearInterval(timeout);
                    resolve();
                } else if (elapsedMs === timeoutMs) {
                    clearInterval(timeout);
                    reject(new Error(`[timeout] ${conditionMethod.toString()}`));
                } else {
                    elapsedMs += intervalMs;
                }
            }).catch((error) => reject(error));
        }, intervalMs);
    });
}

module.exports = { awaitSequence, wait, waitUntil };
