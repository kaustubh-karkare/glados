import React from 'react';
import PropTypes from '../prop-types';
import { BulletList, TextEditor } from '../Common';

import LogEventAdder from './LogEventAdder';
import LogEventEditor from './LogEventEditor';


function ViewerComponent(props) {
    return (
        <TextEditor
            unstyled
            disabled
            value={props.logEvent.title}
        />
    );
}

ViewerComponent.propTypes = {
    logEvent: PropTypes.Custom.LogEvent.isRequired,
};

ViewerComponent.Expanded = (props) => {
    const { logEvent } = props;
    if (!logEvent.details) {
        return null;
    }
    return (
        <TextEditor
            unstyled
            disabled
            value={logEvent.details}
        />
    );
};

ViewerComponent.Expanded.propTypes = {
    logEvent: PropTypes.Custom.LogEvent.isRequired,
};

function LogEventList(props) {
    return (
        <BulletList
            name={props.name}
            dataType="log-event"
            valueKey="logEvent"
            selector={props.selector}
            allowReordering
            allowSubscription
            ViewerComponent={ViewerComponent}
            EditorComponent={LogEventEditor}
            AdderComponent={props.showAdder ? LogEventAdder : null}
        />
    );
}

LogEventList.propTypes = {
    name: PropTypes.string.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    selector: PropTypes.object.isRequired,
    showAdder: PropTypes.bool.isRequired,
};

export default LogEventList;
