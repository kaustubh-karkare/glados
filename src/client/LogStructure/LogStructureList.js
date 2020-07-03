import React from 'react';
import PropTypes from '../prop-types';
import { BulletList, TextEditor } from '../Common';
import LogStructureEditor from './LogStructureEditor';


function ViewerComponent(props) {
    const { logStructure } = props;
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
    logStructure: PropTypes.Custom.LogStructure.isRequired,
};

ViewerComponent.Expanded = (props) => {
    const { logStructure } = props;
    if (!logStructure.titleTemplate) {
        return null;
    }
    return (
        <TextEditor
            unstyled
            disabled
            value={logStructure.titleTemplate}
        />
    );
};

ViewerComponent.Expanded.propTypes = {
    logStructure: PropTypes.Custom.LogStructure.isRequired,
};

function LogStructureList() {
    return (
        <BulletList
            name="Structures"
            dataType="log-structure"
            valueKey="logStructure"
            ViewerComponent={ViewerComponent}
            EditorComponent={LogStructureEditor}
            selector={{ is_indirectly_managed: false }}
        />
    );
}

export default LogStructureList;
