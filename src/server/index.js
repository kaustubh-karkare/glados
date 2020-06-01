import SocketRPC from '../common/socket_rpc';
import Database from './database';
import Actions from './actions';

module.exports = function(io, appConfig) {
  return new Promise(async function(resolve, reject) {
    const database = await Database.init(appConfig.database);
    io.on('connection', (socket) => {
      const api = new SocketRPC(socket);
      Object.entries(Actions).forEach(pair => {
        api.register(pair[0], pair[1].bind({database}));
      });
    });
    resolve();
  });
};
