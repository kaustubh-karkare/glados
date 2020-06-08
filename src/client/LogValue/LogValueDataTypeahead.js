import React from 'react';
import { Typeahead } from '../Common';
import PropTypes from '../prop-types';

function LogValueDataTypeahead(props) {
    return (
        <Typeahead
            {...props}
            id="log_value"
            labelKey="data"
            placeholder=""
            rpcName="log-value-typeahead"
            value={props.logValue}
        />
    );
}

LogValueDataTypeahead.propTypes = {
    logValue: PropTypes.Custom.LogValue.isRequired,
};

export default LogValueDataTypeahead;
