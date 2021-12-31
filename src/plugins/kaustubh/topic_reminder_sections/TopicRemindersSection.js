import React from 'react';

import { DataLoader, Link, SidebarSection } from '../../../client/Common';
import PropTypes from '../../../client/prop-types';

class TopicRemindersSection extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    componentDidMount() {
        this.dataLoader = new DataLoader({
            getInput: () => ({
                name: 'topic-reminders',
                args: {
                    logStructureId: this.props.logStructureId,
                    thresholdDays: this.props.thresholdDays,
                },
            }),
            onData: (result) => this.setState(result),
        });
    }

    componentWillUnmount() {
        this.dataLoader.stop();
    }

    renderContents() {
        const { logTopicAndDayCounts } = this.state;
        if (!logTopicAndDayCounts) {
            return 'Loading ...';
        }
        return logTopicAndDayCounts.map(({ logTopic, dayCount }) => (
            <SidebarSection.Item key={logTopic.__id__}>
                <Link logTopic={logTopic}>{logTopic.name}</Link>
                {dayCount ? <span className="ml-1">{`(${dayCount} days)`}</span> : null}
            </SidebarSection.Item>
        ));
    }

    render() {
        const { logStructure } = this.state;
        const suffix = logStructure ? `: ${logStructure.name}` : '';
        return (
            <SidebarSection title={`Reminders${suffix}`}>
                {this.renderContents()}
            </SidebarSection>
        );
    }
}

TopicRemindersSection.propTypes = {
    logStructureId: PropTypes.number.isRequired,
    thresholdDays: PropTypes.number.isRequired,
};

export default TopicRemindersSection;
