import React from 'react';
import PropTypes from '../prop-types';
import { BulletList, TextEditor } from '../Common';
import LogStructureEditor from './LogStructureEditor';


function ViewerComponent(props) {
    const logStructure = props.value;
    return (
        <div className="log-viewer">
            {logStructure.name}
            <span>
                {logStructure.logKeys.map((logKey, index) => (
                    <span key={logKey.id}>
                        {index ? ', ' : ': '}
                        <span title={logKey.type}>{logKey.name}</span>
                    </span>
                ))}
            </span>
        </div>
    );
}

ViewerComponent.propTypes = {
    value: PropTypes.Custom.LogStructure.isRequired,
};

function ExpandedViewerComponent(props) {
    const logStructure = props.value;
    return (
        <TextEditor
            unstyled
            disabled
            value={logStructure.titleTemplate}
        />
    );
}

ExpandedViewerComponent.propTypes = {
    value: PropTypes.Custom.LogStructure.isRequired,
};

function EditorComponent(props) {
    return (
        <LogStructureEditor
            logStructure={props.value}
            onChange={(logStructure) => props.onChange(logStructure)}
        />
    );
}

EditorComponent.propTypes = {
    value: PropTypes.Custom.LogStructure.isRequired,
    onChange: PropTypes.func.isRequired,
};

function LogStructureList() {
    return (
        <BulletList
            name="Structures"
            dataType="log-structure"
            ViewerComponent={ViewerComponent}
            ExpandedViewerComponent={ExpandedViewerComponent}
            EditorComponent={EditorComponent}
        />
    );
}

export default LogStructureList;
