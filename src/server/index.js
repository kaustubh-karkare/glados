import SocketRPC from '../common/socket_rpc';
import Database from './database';
import Actions from './actions';

import LSDValueTypes from '../common/lsd_value_types';

module.exports = function(io, appConfig) {

  Database.init(appConfig.database)
    .then(database => new Actions(database));

  io.on('connection', (socket) => {
    const api = new SocketRPC(socket);

    api.register('category-typeahead', function(request, resolve) {
      resolve(
        ["ant","bat","bell","cat","dog","eel","fly"]
          .map((name, index) => ({id: index + 1000, name, valueType: LSDValueTypes.STRING.value}))
      );
    });


  });

};
