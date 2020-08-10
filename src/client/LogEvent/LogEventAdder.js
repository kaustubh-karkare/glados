import PropTypes from 'prop-types';
import React from 'react';
import { LogEvent, isRealItem } from '../../data';
import LogEventEditor from './LogEventEditor';
import {
    Coordinator, KeyCodes, TextEditor, TypeaheadOptions,
} from '../Common';

class LogEventAdder extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            logEvent: LogEvent.createVirtual(this.props.where),
        };
    }

    onEditLogEvent(logEvent) {
        this.setState({ logEvent: LogEvent.createVirtual(this.props.where) });
        Coordinator.invoke('modal-editor', {
            dataType: 'log-event',
            EditorComponent: LogEventEditor,
            valueKey: 'logEvent',
            value: logEvent,
        });
    }

    onSaveLogEvent(logEvent) {
        if (logEvent.name) {
            window.api.send('log-event-upsert', logEvent)
                .then((newLogEvent) => {
                    this.setState({ logEvent: LogEvent.createVirtual(this.props.where) });
                });
        } else {
            this.onEditLogEvent(logEvent);
        }
    }

    async onSelect(option) {
        if (option.__type__ === 'log-structure') {
            const logStructure = await window.api.send('log-structure-load', option);
            const updatedLogEvent = LogEvent.createVirtual({
                ...this.props.where,
                logStructure,
            });
            LogEvent.trigger(updatedLogEvent);
            if (logStructure.needsEdit) {
                this.onEditLogEvent(updatedLogEvent);
            } else {
                this.onSaveLogEvent(updatedLogEvent);
            }
        }
    }

    render() {
        const { logEvent } = this.state;
        return (
            <TextEditor
                isSingleLine
                focusOnLoad
                unstyled
                placeholder="Add Event ..."
                value={logEvent.title}
                options={new TypeaheadOptions({
                    serverSideOptions: [{ name: 'log-structure' }, { name: 'log-topic' }],
                    onSelect: (option) => this.onSelect(option),
                })}
                disabled={isRealItem(logEvent.logStructure)}
                onChange={(value) => {
                    const updatedLogEvent = { ...logEvent };
                    updatedLogEvent.title = value;
                    LogEvent.trigger(updatedLogEvent);
                    this.setState({ logEvent: updatedLogEvent });
                }}
                onSpecialKeys={(event) => {
                    if (event.keyCode === KeyCodes.ENTER) {
                        this.onSaveLogEvent(logEvent);
                    }
                }}
                {...this.props}
            />
        );
    }
}

LogEventAdder.propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    where: PropTypes.object,
};

LogEventAdder.defaultProps = {
    where: {},
};

export default LogEventAdder;
