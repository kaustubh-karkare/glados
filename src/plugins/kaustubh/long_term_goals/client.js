import React from 'react';

import { PluginClient, PluginDisplayLocation } from '../../../client/Common';
import LongTermGoalGraph from './LongTermGoalGraph';
import LongTermGoalsSettings from './LongTermGoalsSettings';

export default class extends PluginClient {
    static getSettingsKey() {
        return 'long_term_goals';
    }

    static getSettingsComponent(props) {
        return <LongTermGoalsSettings {...props} />;
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
        return (props.settings || []).map((goal) => (
            <LongTermGoalGraph
                key={goal.newLabel}
                goal={goal}
            />
        ));
    }
}
