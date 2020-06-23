import SocketRPC from '../common/socket_rpc';
import { Actions, Database, bootstrap } from '../data';
import { bootstrapData } from './database.bootstrap';


module.exports = (io, appConfig) => new Promise((resolve) => {
    Database.init(appConfig.database).then((database) => {
        const actions = new Actions(database);
        bootstrap(actions, bootstrapData)
            // eslint-disable-next-line no-console
            .then(() => console.info('Bootstrap complete!'))
            // eslint-disable-next-line no-console
            .catch((e) => console.error('Bootstrap failed!', e));

        io.on('connection', (socket) => {
            const api = new SocketRPC(socket);
            actions.register(api);
        });
        resolve();
    });
});
