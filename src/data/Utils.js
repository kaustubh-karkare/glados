
let negativeID = 0;

class Utils {
    static getNegativeID() {
        negativeID -= 1;
        return negativeID;
    }
}

// This is attached to typeahead suggestions, telling the client-side
// that the item must be loaded before usage.
Utils.INCOMPLETE_KEY = '__incomplete_key__';

// This is attached to typeahead options to indicate
// that an existing item is being updated.
Utils.UPDATE_KEY = '__update_key__';

export default Utils;
