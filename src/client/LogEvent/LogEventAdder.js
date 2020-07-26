import PropTypes from 'prop-types';
import React from 'react';
import { LogEvent, isRealItem } from '../../data';
import LogEventEditor from './LogEventEditor';
import {
    Coordinator, EditorModal, KeyCodes, TextEditor,
} from '../Common';

class LogEventAdder extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            logEvent: LogEvent.createVirtual(this.props.selector),
        };
    }

    onEditLogEvent(logEvent) {
        this.setState({ logEvent: LogEvent.createVirtual(this.props.selector) });
        Coordinator.invoke('modal', EditorModal, {
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
                    Coordinator.invoke('event-created', newLogEvent);
                    this.setState({ logEvent: LogEvent.createVirtual(this.props.selector) });
                });
        } else {
            this.onEditLogEvent(logEvent);
        }
    }

    onSelectSuggestion(option) {
        if (option.__type__ === 'log-topic') {
            const logTopic = option;
            if (logTopic.hasStructure) {
                window.api.send('log-structure-list', { selector: { topic_id: logTopic.id } })
                    .then(([logStructure]) => {
                        const updatedLogEvent = LogEvent.createVirtual({
                            ...this.props.selector,
                            logStructure,
                        });
                        LogEvent.trigger(updatedLogEvent);
                        if (logStructure.needsEdit) {
                            this.onEditLogEvent(updatedLogEvent);
                        } else {
                            this.onSaveLogEvent(updatedLogEvent);
                        }
                    });
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
                serverSideTypes={['log-topic']}
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
                onSelectSuggestion={(option) => this.onSelectSuggestion(option)}
                {...this.props}
            />
        );
    }
}

LogEventAdder.propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    selector: PropTypes.object,
};

LogEventAdder.defaultProps = {
    selector: {},
};

export default LogEventAdder;
