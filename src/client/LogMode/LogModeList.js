import React from 'react';
import PropTypes from 'prop-types';
import { BulletList } from '../Common';
import LogModeEditor from './LogModeEditor';

function LogModeViewer(props) {
    const { logMode } = props;
    return logMode.name;
}

LogModeViewer.propTypes = {
    logMode: PropTypes.Custom.LogMode.isRequired,
};

function LogModeList(props) {
    return (
        <BulletList
            name="Modes"
            dataType="log-mode"
            valueKey="logMode"
            ViewerComponent={LogModeViewer}
            EditorComponent={LogModeEditor}
            allowReordering
            {...props}
        />
    );
}

LogModeList.Single = (props) => (
    <BulletList.Item
        dataType="log-mode"
        value={props.logMode}
        valueKey="logMode"
        ViewerComponent={LogModeViewer}
        EditorComponent={LogModeEditor}
    />
);

LogModeList.Single.propTypes = {
    logMode: PropTypes.Custom.LogMode.isRequired,
};

export default LogModeList;
