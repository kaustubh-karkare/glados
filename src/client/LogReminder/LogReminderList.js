import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import React from 'react';
import assert from '../../common/assert';
import PropTypes from '../prop-types';
import { TextEditor } from '../Common';


class LogReminderList extends React.Component {
    constructor(props) {
        super(props);
        this.state = { logEntries: null };
    }

    componentDidMount() {
        this.onLoad();
    }

    onLoad() {
        const { logReminderGroup } = this.props;
        window.api.send('reminder-list', { logReminderGroup })
            .then((logEntries) => this.setState({ logEntries }));
    }

    onCompleteReminder(logEntry) {
        // TODO: logEntry.logReminder.needsEdit
        window.api.send('reminder-complete', { logEntry })
            .then(() => {
                // Assuming no update needed ...
                this.setState((state) => {
                    state.logEntries = state.logEntries.filter(
                        (item) => item.id !== logEntry.id,
                    );
                    return state;
                });
            });
    }

    renderItem(logEntry) {
        assert(logEntry.logReminder);
        // TODO: Add sources={TextEditorSources} again.
        return (
            <InputGroup key={logEntry.id}>
                <Form.Check
                    type="checkbox"
                    inline
                    checked={false}
                    onChange={(event) => this.onCompleteReminder(logEntry)}
                    style={{ marginRight: 'none' }}
                />
                <TextEditor
                    unstyled
                    disabled
                    value={logEntry.title}
                />
            </InputGroup>
        );
    }

    renderContent() {
        if (this.state.logEntries === null) {
            return 'Loading ...';
        } if (this.state.logEntries.length === 0) {
            return <div className="ml-3">All done!</div>;
        }
        return this.state.logEntries.map((item) => this.renderItem(item));
    }

    render() {
        return (
            <div>
                <div className="log-viewer">
                    <span>{this.props.logReminderGroup.name}</span>
                </div>
                {this.renderContent()}
            </div>
        );
    }
}

LogReminderList.propTypes = {
    logReminderGroup: PropTypes.Custom.LogReminderGroup.isRequired,
};


export default LogReminderList;
