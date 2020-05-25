import SocketRPC from '../common/socket_rpc';

module.exports = function(app, io) {

  io.on('connection', (socket) => {
    console.info("Socket connected!");
    const api = new SocketRPC(socket);

    api.register('square', function(request, resolve) {
      const val = BigInt(request);
      resolve((val * val).toString());
    });
  });

};
