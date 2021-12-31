import React from 'react';

import { PluginClient } from '../../common';
import TimeSection from './TimeSection';
import TimeSectionSettings from './TimeSectionSettings';

export default class extends PluginClient {
    static getSettingsKey() {
        return 'timezones';
    }

    static getSettingsComponent(props) {
        return <TimeSectionSettings {...props} />;
    }

    static getDisplayLocation() {
        return 'right_sidebar_main_top';
    }

    static getDisplayComponent(props) {
        return (props.settings || [])
            .map((item) => (
                <TimeSection
                    key={item.__id__}
                    label={item.label}
                    timezone={item.timezone}
                />
            ));
    }
}
