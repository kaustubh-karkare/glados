import PropTypes from 'prop-types';
import React from 'react';

import { SortableList } from '../Common';
import LogKeyEditor from './LogKeyEditor';

function LogKeyListEditor(props) {
    return (
        <SortableList
            items={props.logKeys}
            disabled={props.disabled}
            onChange={(updatedLogKeys) => props.onChange(updatedLogKeys)}
            onSearch={props.onSearch}
            type={LogKeyEditor}
            itemsKey="logKeys"
        />
    );
}

LogKeyListEditor.propTypes = {
    logKeys: PropTypes.arrayOf(PropTypes.Custom.LogKey.isRequired).isRequired,
    disabled: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired,
    onSearch: PropTypes.func.isRequired,
};

export default LogKeyListEditor;
