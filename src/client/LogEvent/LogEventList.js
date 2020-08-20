import React from 'react';
import PropTypes from 'prop-types';
import { BulletList, LeftRight, TextEditor } from '../Common';

import LogEventAdder from './LogEventAdder';
import LogEventEditor from './LogEventEditor';


function LogEventViewer(props) {
    const content = (
        <div>
            <span className="mr-1" style={{ float: 'left' }}>
                {props.displayDate ? `${props.logEvent.date}: ` : ''}
            </span>
            <TextEditor
                unstyled
                disabled
                value={props.logEvent.title}
            />
        </div>
    );
    if (props.displayLogLevel) {
        return (
            <LeftRight>
                {content}
                {props.displayLogLevel ? `L${props.logEvent.logLevel}` : null}
            </LeftRight>
        );
    }
    return content;
}

LogEventViewer.propTypes = {
    logEvent: PropTypes.Custom.LogEvent.isRequired,
    displayDate: PropTypes.bool,
    displayLogLevel: PropTypes.bool,
};

LogEventViewer.Expanded = (props) => {
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

LogEventViewer.Expanded.propTypes = {
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
            ViewerComponent={LogEventViewer}
            EditorComponent={LogEventEditor}
            AdderComponent={showAdder ? LogEventAdder : null}
        />
    );
}

LogEventList.propTypes = {
    name: PropTypes.string.isRequired,
    showAdder: PropTypes.bool,
};

LogEventList.Single = (props) => {
    const { logEvent, ...moreProps } = props;
    return (
        <BulletList.Item
            {...moreProps}
            dataType="log-event"
            value={logEvent}
            valueKey="logEvent"
            ViewerComponent={LogEventViewer}
            EditorComponent={LogEventEditor}
        />
    );
};

LogEventList.Single.propTypes = {
    logEvent: PropTypes.Custom.LogEvent.isRequired,
};

export default LogEventList;
