import React from 'react';
import { Typeahead } from '../Common';
import PropTypes from '../prop-types';

function LogKeyNameTypeahead(props) {
    return (
        <Typeahead
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
