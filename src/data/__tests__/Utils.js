import '../../common/polyfill';
import Actions from '../Actions';
import { bootstrap } from '../Bootstrap';
import Database from '../Database';
import { bootstrapData } from '../../server/database.bootstrap';

let actions = null;

export default class Utils {
    static async beforeAll() {
        const config = {
            type: 'sqlite',
            host: 'localhost',
            username: 'productivity_test',
            password: 'productivity_test',
            name: 'productivity_test',
        };
        const database = await Database.init(config);
        actions = new Actions(database);
        await bootstrap(actions, bootstrapData);
    }

    static getActions() {
        return actions;
    }

    static async afterAll() {
        if (actions) await actions.database.close();
    }
}
