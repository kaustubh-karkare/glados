import React from 'react';

import { PluginClient } from '../../../client/Common';
import MoreEventListsSettings from './MoreEventListsSettings';

export default class extends PluginClient {
    static getSettingsKey() {
        return 'more_event_lists';
    }

    static getSettingsComponent(props) {
        return <MoreEventListsSettings {...props} />;
    }

    static getDisplayLocation() {
        return null;
    }

    static getDisplayComponent(props) {
        return null;
    }
}
