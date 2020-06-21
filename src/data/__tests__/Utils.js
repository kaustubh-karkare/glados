import '../../common/polyfill';
import Database from '../../server/database';
import bootstrap from '../../server/database.bootstrap';
import Actions from '../../server/Actions';

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
        await bootstrap(actions);
    }

    static getActions() {
        return actions;
    }

    static async afterAll() {
        if (actions) await actions.database.close();
    }
}
