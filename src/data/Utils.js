
let virtualID = 0;

export function getVirtualID() {
    virtualID -= 1;
    return virtualID;
}

export function isVirtualItem(item) {
    return item.id < 0;
}

export function isRealItem(item) {
    return item.id > 0;
}

// This is attached to typeahead suggestions, telling the client-side
// that the item must be loaded before usage.
export const INCOMPLETE_KEY = '__incomplete_key__';

// This is attached to typeahead options to indicate
// that an existing item is being updated.
export const UPDATE_KEY = '__update_key__';
