import PropTypes from 'prop-types';
import React from 'react';

import { BulletList } from '../Common';
import LogStructureGroupEditor from './LogStructureGroupEditor';
import LogStructureList from './LogStructureList';

function LogStructureGroupViewer(props) {
    const { logStructureGroup } = props;
    return (
        <div>{logStructureGroup.name}</div>
    );
}

LogStructureGroupViewer.propTypes = {
    logStructureGroup: PropTypes.Custom.LogStructureGroup.isRequired,
};

LogStructureGroupViewer.Expanded = (props) => {
    const { logStructureGroup, ...viewerComponentProps } = props;
    return (
        <LogStructureList
            where={{ logStructureGroup }}
            allowReordering
            viewerComponentProps={viewerComponentProps}
        />
    );
};

LogStructureGroupViewer.Expanded.propTypes = {
    logStructureGroup: PropTypes.Custom.LogStructureGroup.isRequired,
};

function LogStructureGroupList(props) {
    return (
        <BulletList
            {...props}
            name="Structure Groups"
            dataType="log-structure-group"
            valueKey="logStructureGroup"
            ViewerComponent={LogStructureGroupViewer}
            EditorComponent={LogStructureGroupEditor}
            allowReordering
        />
    );
}

export default LogStructureGroupList;
