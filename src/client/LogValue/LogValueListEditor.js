import React from 'react';
import LogValueEditor from './LogValueEditor';
import PropTypes from '../prop-types';
import { GenericSortableList } from '../Common';

function LogValueListEditor(props) {
    return (
        <GenericSortableList
            {...props}
            type={LogValueEditor}
            itemKey="logValue"
            values={props.logValues}
            onUpdate={props.onUpdate}
        />
    );
}

LogValueListEditor.propTypes = {
    logValues: PropTypes.arrayOf(PropTypes.Custom.LogValue.isRequired).isRequired,
    onUpdate: PropTypes.func.isRequired,
};

export default LogValueListEditor;
