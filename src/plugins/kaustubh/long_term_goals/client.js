import React from 'react';

import { PluginClient, PluginDisplayLocation } from '../../../client/Common';

export default class extends PluginClient {
    static getSettingsKey() {
        return null;
    }

    static getSettingsComponent(props) {
        return null;
    }

    static getDisplayLocation() {
        return PluginDisplayLocation.TAB_SECTION;
    }

    static getTabData() {
        return {
            value: 'long_term_goals',
            label: 'Long Term Goals',
        };
    }

    static getDisplayComponent(props) {
        return <div>TODO</div>;
    }
}
