import SocketRPC from '../common/socket_rpc';
import Database from './database';
import Actions from './actions';

module.exports = function(io, appConfig) {

  Database.init(appConfig.database)
    .then(database => new Actions(database));

  io.on('connection', (socket) => {
    const api = new SocketRPC(socket);

    api.register('square', function(request, resolve) {
      const input = BigInt(request);
      const output = (input * input).toString();
      console.info("square", input.toString(), output);
      resolve(output);
    });
  });

};
