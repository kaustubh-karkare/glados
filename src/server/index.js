import SocketRPC from '../common/socket_rpc';
import Database from './database';
import Actions from './actions';

async function test_actions(database) {
  const actions = new Actions(database);
  const cat1 = await actions.genCreateCategory({name: "Exercise"});
  const log1 = await actions.genCreateLogEntry({name: "Cycling!", category_id: cat1.id});
  console.info("Created =", await log1);
};

module.exports = function(io, appConfig) {

  Database.init(appConfig.database)
    .then(database => test_actions(database))
    .catch(error => console.error(error));

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
