import React from 'react';
import PropTypes from '../prop-types';
import { BulletList, LeftRight, TextEditor } from '../Common';
import LogStructureEditor from './LogStructureEditor';


function LogStructureViewer(props) {
    const { logStructure } = props;
    let suffix;
    if (logStructure.isPeriodic) {
        if (logStructure.frequencyArgs) {
            suffix = `(${logStructure.frequency}: ${logStructure.frequencyArgs})`;
        } else {
            suffix = `(${logStructure.frequency})`;
        }
    }
    return (
        <LeftRight>
            <TextEditor
                unstyled
                disabled
                value={logStructure.titleTemplate}
            />
            {suffix}
        </LeftRight>
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
        />
    );
}

LogStructureList.Single = (props) => (
    <BulletList.Item
        dataType="log-structure"
        value={props.logStructure}
        valueKey="logStructure"
        ViewerComponent={LogStructureViewer}
        EditorComponent={LogStructureEditor}
    />
);

LogStructureList.Single.propTypes = {
    logStructure: PropTypes.Custom.LogStructure.isRequired,
};

export default LogStructureList;
