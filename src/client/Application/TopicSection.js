import React from 'react';
import PropTypes from 'prop-types';
import InputGroup from 'react-bootstrap/InputGroup';
import { GoPrimitiveDot } from 'react-icons/go';
import {
    DataLoader, Icon, SidebarSection,
} from '../Common';
import TextEditorUtils from '../../common/TextEditorUtils';

class TopicSection extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    componentDidMount() {
        this.dataLoader = new DataLoader({
            getInput: () => ({
                name: 'log-topic-load',
                args: { id: this.props.id },
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
        const details = TextEditorUtils.deserialize(
            logTopic.details,
            TextEditorUtils.StorageType.MARKDOWN,
        );
        const lines = details.split('\n')
            .filter((line) => line.startsWith('- '))
            .map((line) => line.substr(2));
        return lines.map((item) => (
            <InputGroup key={item}>
                <Icon alwaysHighlighted className="mr-1">
                    <GoPrimitiveDot />
                </Icon>
                {item}
            </InputGroup>
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
    id: PropTypes.number.isRequired,
};

export default TopicSection;
