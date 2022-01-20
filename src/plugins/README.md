### Expectations

* File names ending with `actions.js` are supposed to export an object, whose keys are "action names" and values are the corresponding implementations, which are new RPCs that the server will now support.
* File names ending with `client.js` are supposed to export a class that extends the `[PluginClient](../client/Common/Plugins.js)` interface, which describes how to augment the UI.

### Activation

* In your `config.json` file, you will need to provide a list of regexes that match the plugin paths that you want to activate:

```
{
    ...
    "plugins": [
        "kaustubh/.*"
    ]
}
```
