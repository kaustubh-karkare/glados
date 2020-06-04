import SocketRPC from '../common/socket_rpc';
import Database from './database';
import Actions from './actions';

module.exports = (io, appConfig) => new Promise((resolve) => {
    Database.init(appConfig.database).then((database) => {
        io.on('connection', (socket) => {
            const api = new SocketRPC(socket);
            Object.entries(Actions).forEach((pair) => {
                api.register(pair[0], pair[1].bind({ database }));
            });
        });
        resolve();
    });
});
