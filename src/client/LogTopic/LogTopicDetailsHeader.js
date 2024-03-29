import PropTypes from 'prop-types';
import React from 'react';

import {
    Coordinator, Dropdown, InputLine, Link,
} from '../Common';
import LogTopicOptions from './LogTopicOptions';

class LogTopicDetailsHeader extends React.Component {
    static onSearchButtonClick(logTopic) {
        Coordinator.invoke('url-update', { search: [logTopic] });
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
                    options={LogTopicOptions.get({ allowCreation: true, parentLogTopic: logTopic })}
                    onChange={(childLogTopic) => Coordinator.invoke(
                        'url-update',
                        { details: childLogTopic },
                    )}
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
