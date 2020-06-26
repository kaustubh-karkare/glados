import React from 'react';
import PropTypes from '../prop-types';
import { BulletList, TextEditor } from '../Common';
import LogStructureEditor from './LogStructureEditor';


function ViewerComponent(props) {
    const logStructure = props.value;
    if (!props.isExpanded) {
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
    return (
        <TextEditor
            unstyled
            disabled
            value={logStructure.titleTemplate}
        />
    );
}

ViewerComponent.propTypes = {
    value: PropTypes.Custom.LogStructure.isRequired,
    isExpanded: PropTypes.bool.isRequired,
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
            EditorComponent={EditorComponent}
            ViewerComponent={ViewerComponent}
        />
    );
}

export default LogStructureList;
