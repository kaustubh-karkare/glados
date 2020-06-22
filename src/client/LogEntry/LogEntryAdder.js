import { GoPrimitiveDot } from 'react-icons/go';
import InputGroup from 'react-bootstrap/InputGroup';
import PropTypes from 'prop-types';
import React from 'react';
import { LogEntry } from '../../data';
import LogEntryTitleEditor from './LogEntryTitleEditor';

class LogEntryAdder extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            logEntry: LogEntry.createEmpty(),
        };
    }

    onEdit(logEntry) {
        this.setState({ logEntry: LogEntry.createEmpty() });
        this.props.onEdit(logEntry);
    }

    onSave(logEntry) {
        this.setState({ logEntry: LogEntry.createEmpty() });
        if (logEntry.name) {
            this.props.onSave(logEntry);
        } else {
            this.props.onEdit(logEntry);
        }
    }

    render() {
        return (
            <InputGroup size="sm">
                <div className="compact-option" />
                <div className="compact-option">
                    {this.state.logEntry.name ? <GoPrimitiveDot /> : null}
                </div>
                <div className="mx-1">
                    <LogEntryTitleEditor
                        logEntry={this.state.logEntry}
                        onUpdate={(logEntry) => this.setState({ logEntry })}
                        onMajorUpdate={(logEntry) => this.onEdit(logEntry)}
                        unstyled
                        onEnter={() => this.onSave(this.state.logEntry)}
                        placeholder="Add Entry ..."
                    />
                </div>
            </InputGroup>
        );
    }
}

LogEntryAdder.propTypes = {
    onSave: PropTypes.func.isRequired,
    onEdit: PropTypes.func.isRequired,
};

export default LogEntryAdder;
