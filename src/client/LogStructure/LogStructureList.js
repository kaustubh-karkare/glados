import React from 'react';
import PropTypes from '../prop-types';
import { BulletList, TextEditor } from '../Common';
import LogStructureEditor from './LogStructureEditor';


function LogStructureViewer(props) {
    const { logStructure } = props;
    return (
        <TextEditor
            unstyled
            disabled
            value={logStructure.titleTemplate}
        />
    );
}

LogStructureViewer.propTypes = {
    logStructure: PropTypes.Custom.LogStructure.isRequired,
};

function LogStructureList(props) {
    return (
        <BulletList
            {...props}
            name="Structures"
            dataType="log-structure"
            valueKey="logStructure"
            ViewerComponent={LogStructureViewer}
            EditorComponent={LogStructureEditor}
            allowReordering
        />
    );
}

export default LogStructureList;
