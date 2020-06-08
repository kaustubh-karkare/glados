import React from 'react';
import { Typeahead } from '../Common';
import PropTypes from '../prop-types';

function LogValueDataTypeahead(props) {
    return (
        <Typeahead
            id="log_value"
            labelKey="data"
            onUpdate={props.onUpdate}
            placeholder=""
            rpcName="log-value-typeahead"
            value={props.logValue}
        />
    );
}

LogValueDataTypeahead.propTypes = {
    logValue: PropTypes.Custom.LogValue.isRequired,
    onUpdate: PropTypes.func.isRequired,
};

export default LogValueDataTypeahead;
