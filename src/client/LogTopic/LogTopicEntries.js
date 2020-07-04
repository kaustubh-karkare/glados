import React from 'react';
import PropTypes from 'prop-types';
import { DataLoader, TextEditor } from '../Common';

class LogTopicEntries extends React.Component {
    constructor(props) {
        super(props);
        this.state = { logEntries: null };
    }

    componentDidMount() {
        this.componentDidUpdate();
    }

    componentDidUpdate(prevProps) {
        if (!prevProps || prevProps.logTopicId !== this.props.logTopicId) {
            this.dataLoader = new DataLoader({
                name: 'log-entry-list',
                args: {
                    selector: { topic_id: this.props.logTopicId },
                    ordering: true,
                },
                callback: (logEntries) => this.setState({ logEntries }),
            });
        }
    }

    componentWillUnmount() {
        this.dataLoader.stop();
    }

    render() {
        if (!this.state.logEntries) {
            return 'Loading ...';
        }
        return this.state.logEntries.map((logEntry) => (
            <TextEditor
                key={logEntry.id}
                unstyled
                disabled
                value={logEntry.title}
            />
        ));
    }
}

LogTopicEntries.propTypes = {
    logTopicId: PropTypes.number.isRequired,
};

export default LogTopicEntries;
