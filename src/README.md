### Code Organization

* While `server/` and `client/` are self explanatory, `common/` contains code that is used by both. Meanwhile, `demo/` contains a isolated program for E2E testing and generating demo videos.
* Data Model: `server/models.js` contains the database schema, which is an excellent starting point. `common/data_types/api.js` is an interface that (almost) all datatypes need to implement, and the other files in that directory contain implementations of that API, along with additional utilities.
* Server: `server/database.js` is a wrapper over Sequelize, providing an useful API for "actions". `server/actions.js` creates a registry for all the RPCs that the client can invoke, by looking at all files in `server/actions/`. And finally, `server/index.js` initializes the webserver, and allows clients to invoke these actions.
* Client: `client/index.js` initializes React, which powers the whole UI. While `common/utils/socket_rpc.js` sets up a communication system between server and client, `client/Common/Coordinator.js` allows communication between different UI components. `client/Common/DataLoader.js` is a commonly used utility to not just load data once, but subscribe to changes and react to them (look for `this.broadcast` method calls in server-side actions), allowing different UI components to remain in sync.

### Backup File Size Estimation

* (1 kilobyte / event) * (50 events / day) * (365 days / year) * (10 years) = 182,500,000 bytes < 200 MB for 10 years.
* Note that the above estimation does not include other data types, but those are infrequently created, and not separately counted.
* The total size can reduced significantly by compressing the backup file if needed. JSON was picked for human readability, not for space efficiency.
