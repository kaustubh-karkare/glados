import React from 'react';
import PropTypes from 'prop-types';
import { BulletList, DetailsIcon, TextEditor } from '../Common';

import LogEventAdder from './LogEventAdder';
import LogEventEditor from './LogEventEditor';

function LogEventViewer(props) {
    const { logEvent } = props;
    let datePrefix;
    if (props.displayDate) {
        datePrefix = (
            <span className="float-left monospace">
                {`${logEvent.date}: `}
            </span>
        );
    }
    const title = (
        <span className="ml-1">
            <TextEditor.SimpleViewer
                unstyled
                disabled
                value={logEvent.title}
            />
        </span>
    );
    let detailsSuffix;
    if (logEvent.details) {
        detailsSuffix = (
            <DetailsIcon
                onClick={props.toggleExpansion}
                isShown
            />
        );
    }
    let logLevelSuffix;
    if (props.displayLogLevel) {
        logLevelSuffix = (
            <span className="float-right ml-1">
                {`L${logEvent.logLevel}`}
            </span>
        );
    }
    return (
        <div>
            {datePrefix}
            {logLevelSuffix}
            {title}
            {detailsSuffix}
        </div>
    );
}

LogEventViewer.propTypes = {
    logEvent: PropTypes.Custom.LogEvent.isRequired,
    displayDate: PropTypes.bool,
    displayLogLevel: PropTypes.bool,
    toggleExpansion: PropTypes.func.isRequired,
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
