
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

export default Utils;
