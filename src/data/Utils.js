
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

// This is attached to typeahead suggestions, telling the client-side
// that the item must be loaded before usage.
export const INCOMPLETE_KEY = '__incomplete_key__';

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

export async function manageEntityBefore(inputSubItem, DataType) {
    if (inputSubItem) {
        // Condition? add, edit, associate, disassociate.

        // Warning! Having to change context here is an abstraction leak!
        const itemId = await DataType.save.call({ ...this, DataType }, inputSubItem);
        return inputSubItem.isIndirectlyManaged ? itemId : null;
    }
    return null;
}

export async function manageEntityAfter(prevItemId, inputSubItem, DataType) {
    if (prevItemId && !inputSubItem) {
        // Condition? delete

        // Warning! Having to change context here is an abstraction leak!
        await DataType.delete.call({ ...this, DataType }, prevItemId);
    }
}
