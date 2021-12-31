### Expectations

* File names ending with `actions.js` are supposed to export an object, whose keys are "action names" and values are the corresponding implementations, which are new RPCs that the server will now support.
* File names ending with `client.js` are supposed to export a class that extends the `PluginClient` interface, which describes how to augment the UI.
