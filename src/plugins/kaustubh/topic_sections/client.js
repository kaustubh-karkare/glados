import React from 'react';

import { PluginClient } from '../../common';
import TopicSection from './TopicSection';
import TopicSectionSettings from './TopicSectionSettings';

export default class extends PluginClient {
    static getSettingsKey() {
        return 'topic_sections';
    }

    static getSettingsComponent(props) {
        return <TopicSectionSettings {...props} />;
    }

    static getDisplayLocation() {
        return 'right_sidebar_widgets_top';
    }

    static getDisplayComponent(props) {
        return (props.settings || [])
            .map((item) => (
                <TopicSection
                    key={item.__id__}
                    logTopicId={item.logTopic.__id__}
                />
            ));
    }
}
