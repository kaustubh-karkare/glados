import React from 'react';
import TopicRemindersSection from './TopicRemindersSection';
import TopicRemindersSectionSettings from './TopicRemindersSectionSettings';
import { PluginClient } from '../../common';

export default class extends PluginClient {
    static getSettingsKey() {
        return 'reminder_sections';
    }

    static getSettingsComponent(props) {
        return <TopicRemindersSectionSettings {...props} />;
    }

    static getDisplayLocation() {
        return 'right_sidebar_widgets_bottom';
    }

    static getDisplayComponent(props) {
        return (props.settings || [])
            .map((item) => (
                <TopicRemindersSection
                    key={item.__id__}
                    logStructureId={item.logStructure.__id__}
                    thresholdDays={parseInt(item.thresholdDays, 10)}
                />
            ));
    }
}
