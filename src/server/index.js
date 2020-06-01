import SocketRPC from '../common/socket_rpc';
import Database from './database';
import Actions from './actions';

import LSDValueTypes from '../common/lsd_value_types';

module.exports = function(io, appConfig) {
  return new Promise(async function(resolve, reject) {
    const actions = await Database.init(appConfig.database)
      .then(database => new Actions(database));
    io.on('connection', (socket) => {
      const api = new SocketRPC(socket);

      api.register("category-list", async (request) => {
        return await actions.getCategories();
      });

      api.register("category-update", async (request) => {
        return await actions.createOrUpdateCategory(request);
      });

      api.register("category-delete", async (request) => {
        return await actions.deleteCategory(request);
      });

      api.register("lsd-key-typeahead", async (request) => {
        return await actions.getLsdKeys();
      });

    });
    resolve();
  });
};
