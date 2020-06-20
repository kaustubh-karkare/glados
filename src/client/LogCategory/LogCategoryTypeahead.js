import React from 'react';
import PropTypes from '../prop-types';
import { Typeahead } from '../Common';


function LogCategoryTypeahead(props) {
    return (
        <Typeahead
            {...props}
            id="log_category"
            labelKey="name"
            rpcName="log-category-list"
            value={props.logCategory}
        />
    );
}

LogCategoryTypeahead.propTypes = {
    logCategory: PropTypes.Custom.LogCategory.isRequired,
};

export default LogCategoryTypeahead;
