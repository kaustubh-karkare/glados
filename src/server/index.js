import SocketRPC from '../common/socket_rpc';
import Database from './database';
import Actions from './actions';
import bootstrap from './database.bootstrap';


module.exports = (io, appConfig) => new Promise((resolve) => {
    Database.init(appConfig.database).then((database) => {
        bootstrap(Actions, database)
            // eslint-disable-next-line no-console
            .then(() => console.info('Bootstrap complete!'))
            // eslint-disable-next-line no-console
            .catch((error) => console.error(error));

        io.on('connection', (socket) => {
            const api = new SocketRPC(socket);
            Object.entries(Actions).forEach((pair) => {
                api.register(pair[0], pair[1].bind({ database }));
            });
        });
        resolve();
    });
});
