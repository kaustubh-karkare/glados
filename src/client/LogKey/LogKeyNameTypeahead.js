import React from 'react';
import GenericTypeahead from '../GenericTypeahead.react';
import PropTypes from '../prop-types';

function LogKeyNameTypeahead(props) {
    return (
        <GenericTypeahead
            {...props}
            id="log_key"
            labelKey="name"
            placeholder="Key Name"
            rpcName="log-key-list"
            value={props.logKey}
        />
    );
}

LogKeyNameTypeahead.propTypes = {
    logKey: PropTypes.Custom.LogKey.isRequired,
};

export default LogKeyNameTypeahead;
