import React from 'react';
import { BulletList } from '../Common';
import LogKeyEditor from './LogKeyEditor';
import PropTypes from '../prop-types';

function ViewerComponent(props) {
    const { logKey } = props;
    return (
        <div className="log-viewer">
            {logKey.name}
            <span>{` (${logKey.type})`}</span>
        </div>
    );
}

ViewerComponent.propTypes = {
    logKey: PropTypes.Custom.LogKey.isRequired,
};

function LogKeyList() {
    return (
        <BulletList
            name="Keys"
            dataType="log-key"
            valueKey="logKey"
            ViewerComponent={ViewerComponent}
            EditorComponent={LogKeyEditor}
        />
    );
}

export default LogKeyList;
