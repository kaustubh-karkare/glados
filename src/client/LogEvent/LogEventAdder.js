import PropTypes from 'prop-types';
import React from 'react';
import { LogEvent, isRealItem } from '../../data';
import LogEventEditor from './LogEventEditor';
import { EditorModal, KeyCodes, TextEditor } from '../Common';

class LogEventAdder extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            logEvent: LogEvent.createVirtual(this.props.selector),
        };
    }

    onEditLogEvent(logEvent) {
        this.setState({ logEvent: LogEvent.createVirtual(this.props.selector) });
        window.modalStack_push(EditorModal, {
            dataType: 'log-event',
            EditorComponent: LogEventEditor,
            valueKey: 'logEvent',
            value: logEvent,
            closeOnSave: true,
        });
    }

    onSaveLogEvent(logEvent) {
        if (logEvent.name) {
            window.api.send('log-event-upsert', logEvent)
                .then((value) => {
                    this.setState({ logEvent: LogEvent.createVirtual(this.props.selector) });
                })
                .catch((error) => window.modalStack_displayError(error));
        } else {
            this.onEditLogEvent(logEvent);
        }
    }

    onSelectSuggestion(option) {
        if (option.__type__ === 'log-structure') {
            const logStructure = option;
            const updatedLogEvent = LogEvent.createVirtual({
                ...this.props.selector,
                logStructure,
            });
            LogEvent.trigger(updatedLogEvent);
            this.onEditLogEvent(updatedLogEvent);
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
                serverSideTypes={['log-topic', 'log-structure']}
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
