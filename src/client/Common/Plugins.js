/* eslint-disable max-classes-per-file */

import React from 'react';

import { Enum } from '../../common/data_types';
import PropTypes from '../prop-types';
import SettingsContext from './SettingsContext';

export class PluginClient {
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

    static getTabData() {
        // Return an object that contains data about an extra Tab.
        // { value: string, label: string }
        throw new Error('not implemented');
    }
}

export const PluginDisplayLocation = Enum([
    {
        value: 'tab_section',
    },
    {
        value: 'right_sidebar_main_top',
    },
    {
        value: 'right_sidebar_main_bottom',
    },
    {
        value: 'right_sidebar_widgets_top',
    },
    {
        value: 'right_sidebar_widgets_bottom',
    },
]);

export class PluginDisplayComponent extends React.Component {
    renderActual(settings) {
        const results = [];
        Object.entries(this.props.plugins).forEach(([name, api]) => {
            if (api.getDisplayLocation() !== this.props.location) {
                return;
            }
            const key = api.getSettingsKey();
            const props = {
                settings: key ? settings[key] : null,
            };
            results.push(<div key={`plugin:${name}`}>{api.getDisplayComponent(props)}</div>);
        });
        return results;
    }

    render() {
        return (
            <SettingsContext.Consumer>
                {(settings) => this.renderActual(settings)}
            </SettingsContext.Consumer>
        );
    }
}

PluginDisplayComponent.propTypes = {
    plugins: PropTypes.Custom.Plugins.isRequired,
    location: PropTypes.string.isRequired,
};
