import React from 'react';
import PropTypes from '../prop-types';
import {
    Coordinator, Dropdown, InputLine, Link,
} from '../Common';

class LogTopicDetailsHeader extends React.Component {
    static onSearchButtonClick(logTopic) {
        Coordinator.invoke('log-topic-select', logTopic);
    }

    renderParentTopic() {
        const { logTopic } = this.props;
        if (!logTopic.parentLogTopic) {
            return null;
        }
        return (
            <>
                <Link logTopic={logTopic.parentLogTopic}>
                    {logTopic.parentLogTopic.name}
                </Link>
                {' / '}
            </>
        );
    }

    renderChildTopics() {
        const { logTopic } = this.props;
        if (logTopic.hasStructure) {
            return null;
        }
        return (
            <>
                {' / '}
                <Dropdown
                    disabled={false}
                    options={{
                        name: 'log-topic-list',
                        args: {
                            where: { parent_topic_id: logTopic.id },
                            ordering: true,
                        },
                    }}
                    onChange={(childLogTopic) => Coordinator.invoke('details', childLogTopic)}
                >
                    <a href="#" className="topic">...</a>
                </Dropdown>
            </>
        );
    }

    render() {
        const { logTopic } = this.props;
        return (
            <InputLine overflow styled className="px-2">
                {this.renderParentTopic()}
                {logTopic.name}
                {this.renderChildTopics()}
            </InputLine>
        );
    }
}

LogTopicDetailsHeader.propTypes = {
    logTopic: PropTypes.Custom.LogTopic.isRequired,
};

export default LogTopicDetailsHeader;
