import PropTypes from 'prop-types';
import React from 'react';
import { LogEntry } from '../../data';
import LogEntryTitleEditor from './LogEntryTitleEditor';
import LogEntryEditor from './LogEntryEditor';
import { EditorModal, KeyCodes } from '../Common';

class LogEntryAdder extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            logEntry: LogEntry.createVirtual(this.props.selector),
        };
    }

    onEdit(logEntry) {
        this.setState({ logEntry: LogEntry.createVirtual(this.props.selector) });
        window.modalStack_push(EditorModal, {
            dataType: 'log-entry',
            EditorComponent: LogEntryEditor,
            value: logEntry,
            closeOnSave: true,
        });
    }

    onSave(logEntry) {
        if (logEntry.name) {
            window.api.send('log-entry-upsert', logEntry)
                .then((value) => {
                    this.setState({ logEntry: LogEntry.createVirtual(this.props.selector) });
                })
                .catch((error) => window.modalStack_displayError(error));
        } else {
            this.onEdit(logEntry);
        }
    }

    render() {
        return (
            <LogEntryTitleEditor
                logEntry={this.state.logEntry}
                selector={this.props.selector}
                onUpdate={(logEntry) => this.setState({ logEntry })}
                onMajorUpdate={(logEntry) => this.onEdit(logEntry)}
                unstyled
                onSpecialKeys={(event) => {
                    if (event.keyCode === KeyCodes.ENTER) {
                        this.onSave(this.state.logEntry);
                    }
                }}
                placeholder="Add Entry ..."
            />
        );
    }
}

LogEntryAdder.propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    selector: PropTypes.object,
};

export default LogEntryAdder;
