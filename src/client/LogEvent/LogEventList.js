import React from 'react';
import PropTypes from '../prop-types';
import { BulletList, TextEditor } from '../Common';

import LogEventAdder from './LogEventAdder';
import LogEventEditor from './LogEventEditor';


function ViewerComponent(props) {
    return (
        <>
            <TextEditor
                unstyled
                disabled
                value={props.logEvent.title}
            />
            {props.displayIsMajor && props.logEvent.isMajor ? '(major)' : null}
        </>
    );
}

ViewerComponent.propTypes = {
    logEvent: PropTypes.Custom.LogEvent.isRequired,
    displayIsMajor: PropTypes.bool,
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
    const { showAdder, ...moreProps } = props;
    return (
        <BulletList
            {...moreProps}
            dataType="log-event"
            valueKey="logEvent"
            allowSubscription
            ViewerComponent={ViewerComponent}
            EditorComponent={LogEventEditor}
            AdderComponent={showAdder ? LogEventAdder : null}
        />
    );
}

LogEventList.propTypes = {
    name: PropTypes.string.isRequired,
    showAdder: PropTypes.bool.isRequired,
};

export default LogEventList;
