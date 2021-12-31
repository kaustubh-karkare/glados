import PropTypes from 'prop-types';
import React from 'react';

import { DataLoader, SidebarSection } from '../../../client/Common';
import RichTextUtils from '../../../common/RichTextUtils';

class TopicSection extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    componentDidMount() {
        this.dataLoader = new DataLoader({
            getInput: () => ({
                name: 'log-topic-load',
                args: { __id__: this.props.logTopicId },
            }),
            onData: (logTopic) => this.setState({ logTopic }),
        });
    }

    componentWillUnmount() {
        this.dataLoader.stop();
    }

    renderContent() {
        const { logTopic } = this.state;
        if (!logTopic) {
            return 'Loading ...';
        }
        // TODO: Update the style of bullet items in the TextEditor, use that instead.
        const details = RichTextUtils.deserialize(
            RichTextUtils.serialize(
                logTopic.details,
                RichTextUtils.StorageType.DRAFTJS,
            ),
            RichTextUtils.StorageType.MARKDOWN,
        );
        const lines = details.split('\n')
            .filter((line) => line.startsWith('- '))
            .map((line) => line.substr(2));
        return lines.map((item) => (
            <SidebarSection.Item key={item}>
                {item}
            </SidebarSection.Item>
        ));
    }

    render() {
        const { logTopic } = this.state;
        return (
            <SidebarSection title={logTopic ? logTopic.name : '???'}>
                {this.renderContent()}
            </SidebarSection>
        );
    }
}

TopicSection.propTypes = {
    logTopicId: PropTypes.number.isRequired,
};

export default TopicSection;
