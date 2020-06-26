import '../../common/polyfill';
import Actions from '../Actions';
import { loadData, saveData } from '../Bootstrap';
import Database from '../Database';

let actions = null;

export default class Utils {
    static async beforeEach() {
        const config = {
            type: 'sqlite',
            host: 'localhost',
            username: 'productivity_test',
            password: 'productivity_test',
            name: 'productivity_test',
        };
        const database = await Database.init(config);
        actions = new Actions(database);
    }

    static async loadData(data) {
        await loadData(actions, data);
    }

    static async saveData() {
        return saveData(actions);
    }

    static getActions() {
        return actions;
    }

    static async afterEach() {
        if (actions) await actions.database.close();
    }
}
