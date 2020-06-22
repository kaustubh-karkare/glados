import React from 'react';
import PropTypes from '../prop-types';
import { BulletList, TextEditor } from '../Common';
import LogCategoryEditor from './LogCategoryEditor';


function ViewerComponent(props) {
    const logCategory = props.value;
    if (!props.isExpanded) {
        return (
            <div className="log-class-viewer">
                {logCategory.name}
                <span>
                    {logCategory.logKeys.map((logKey, index) => (
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
            value={logCategory.template}
        />
    );
}

ViewerComponent.propTypes = {
    value: PropTypes.Custom.LogCategory.isRequired,
    isExpanded: PropTypes.bool.isRequired,
};

function EditorComponent(props) {
    return (
        <LogCategoryEditor
            logCategory={props.value}
            onChange={(logCategory) => props.onChange(logCategory)}
        />
    );
}

EditorComponent.propTypes = {
    value: PropTypes.Custom.LogCategory.isRequired,
    onChange: PropTypes.func.isRequired,
};

function LogCategoryList() {
    return (
        <BulletList
            name="Categories"
            dataType="log-category"
            EditorComponent={EditorComponent}
            ViewerComponent={ViewerComponent}
        />
    );
}

export default LogCategoryList;
