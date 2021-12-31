### Code Organization

* While `server/` and `client/` are self explanatory, `common/` and `plugins/` contain code that is used by both. On the other hand, `demo/` contains an isolated program for E2E testing and generating demo videos (which uses a separate `config.json` to avoid conflicts with the production database).
* Data Model: [`server/models.js`](server/models.js) contains the database schema, which is an excellent starting point. [`common/data_types/api.js`](common/data_types/api.js) is an interface that (almost) all datatypes need to implement, and the other files in that directory contain implementations of that API, along with additional utilities.
* Server: [`server/database.js`](server/database.js) is a wrapper over Sequelize, providing an useful API for "actions". [`server/actions.js`](server/actions.js) creates a registry for all the RPCs that the client can invoke, by looking at all files in [`server/actions/`](server/actions/). And finally, [`server/index.js`](server/index.js) initializes the webserver, and allows clients to invoke these actions.
* Client: [`client/index.js`](client/index.js) initializes React, which powers the whole UI. While [`common/SocketRPC.js`](common/SocketRPC.js) sets up a communication system between server and client, [`client/Common/Coordinator.js`](client/Common/Coordinator.js) allows communication between different UI components. [`client/Common/DataLoader.js`](client/Common/DataLoader.js) is a commonly used utility to not just load data once, but subscribe to changes and react to them (look for `this.broadcast` method calls in server-side actions), allowing different UI components to remain in sync.
* Plugins: This is custom logic that can be activated in the tool, augmenting core functionality, but is likely not relevant for everyone. See the README file in that directory for more details.

### Backup File Size Estimation

* (1 kilobyte / event) * (50 events / day) * (365 days / year) * (10 years) = 182,500,000 bytes < 200 MB for 10 years. Note that this estimation does not include other data types, but those are infrequently created, and not separately counted.
* The total size can reduced significantly by compressing the backup file if needed. JSON was picked for human readability, not for space efficiency. A simple experiment with "gzip" results in a file size that was 10% of the original.
