export default class PluginClient {
    static getSettingsKey() {
        // The key corresponding to the setting for your plugin.
        // Must be unique across all plugins.
        // Maybe infer this based on path?
        throw new Error('not implemented');
    }

    static getSettingsComponent() {
        // Return a React element that is rendered in the SettingsEditor.
        // Props = { disabled: bool, value: any, onChange: function }
        throw new Error('not implemented');
    }

    static getDisplayLocation() {
        // A string that indicated where this component should be rendered.
        // The various options can be found in Application.js
        throw new Error('not implemented');
    }

    static getDisplayComponent() {
        // Return a React element that is rendered in the application UI.
        // Gets the "setting" as property.
        throw new Error('not implemented');
    }
}
