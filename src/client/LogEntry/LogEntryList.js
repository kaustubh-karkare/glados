import React from 'react';
import PropTypes from '../prop-types';
import { BulletList, TextEditor } from '../Common';

import { LogEntry } from '../../data';
import LogEntryAdder from './LogEntryAdder';
import LogEntryEditor from './LogEntryEditor';
import { TextEditorSources } from './LogEntryTitleEditor';


function ViewerComponent(props) {
    const logEntry = props.value;
    if (!props.isExpanded) {
        return (
            <TextEditor
                unstyled
                disabled
                sources={TextEditorSources}
                value={logEntry.title}
            />
        );
    }
    if (!logEntry.details) {
        return null;
    }
    return (
        <TextEditor
            unstyled
            disabled
            sources={TextEditorSources}
            value={logEntry.details}
        />
    );
}

ViewerComponent.propTypes = {
    value: PropTypes.Custom.LogEntry.isRequired,
    isExpanded: PropTypes.bool.isRequired,
};

function EditorComponent(props) {
    return (
        <LogEntryEditor
            logEntry={props.value}
            onUpdate={(logEntry) => {
                LogEntry.trigger(logEntry);
                props.onChange(logEntry);
            }}
            onSpecialKeys={props.onSpecialKeys}
        />
    );
}

EditorComponent.propTypes = {
    value: PropTypes.Custom.LogEntry.isRequired,
    onChange: PropTypes.func.isRequired,
    onSpecialKeys: PropTypes.func.isRequired,
};

class LogEntryList extends React.Component {
    constructor(props) {
        super(props);
        this.state = { dates: null };
    }

    componentDidMount() {
        this.reload();
    }

    reload() {
        window.api.send('log-entry-dates')
            .then((dates) => this.setState({ dates }));
    }

    render() {
        if (this.state.dates === null) {
            return 'Loading ...';
        }
        return this.state.dates.map((date, index, list) => {
            const isLastItem = index === list.length - 1;
            return (
                <BulletList
                    key={date}
                    name={date}
                    selector={{ date }}
                    dataType="log-entry"
                    EditorComponent={EditorComponent}
                    ViewerComponent={ViewerComponent}
                    AdderComponent={isLastItem ? LogEntryAdder : null}
                />
            );
        });
    }
}

export default LogEntryList;
