import React from 'react';
import PropTypes from 'prop-types';
import { DataLoader, TextEditor } from '../Common';

class LogTopicEntries extends React.Component {
    constructor(props) {
        super(props);
        this.state = { logEvents: null };
    }

    componentDidMount() {
        this.componentDidUpdate();
    }

    componentDidUpdate(prevProps) {
        if (!prevProps || prevProps.logTopicId !== this.props.logTopicId) {
            this.dataLoader = new DataLoader({
                name: 'log-event-list',
                args: {
                    selector: { topic_id: this.props.logTopicId },
                    ordering: true,
                },
                callback: (logEvents) => this.setState({ logEvents }),
            });
        }
    }

    componentWillUnmount() {
        this.dataLoader.stop();
    }

    render() {
        if (!this.state.logEvents) {
            return 'Loading ...';
        }
        return this.state.logEvents.map((logEvent) => (
            <TextEditor
                key={logEvent.id}
                unstyled
                disabled
                value={logEvent.title}
            />
        ));
    }
}

LogTopicEntries.propTypes = {
    logTopicId: PropTypes.number.isRequired,
};

export default LogTopicEntries;
