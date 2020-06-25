import PropTypes from 'prop-types';
import React from 'react';
import { LogEntry } from '../../data';
import LogEntryTitleEditor from './LogEntryTitleEditor';
import { KeyCodes } from '../Common';

class LogEntryAdder extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            logEntry: LogEntry.createVirtual(this.props.selector),
        };
    }

    onEdit(logEntry) {
        this.setState({ logEntry: LogEntry.createVirtual() });
        this.props.onEdit(logEntry);
    }

    onSave(logEntry) {
        this.setState({ logEntry: LogEntry.createVirtual() });
        if (logEntry.name) {
            this.props.onSave(logEntry);
        } else {
            this.props.onEdit(logEntry);
        }
    }

    render() {
        return (
            <LogEntryTitleEditor
                logEntry={this.state.logEntry}
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
    onSave: PropTypes.func.isRequired,
    onEdit: PropTypes.func.isRequired,
};

export default LogEntryAdder;
