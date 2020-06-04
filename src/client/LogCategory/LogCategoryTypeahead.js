import React from 'react';
import PropTypes from '../prop-types';

import GenericTypeahead from '../GenericTypeahead.react';


function LogCategoryTypeahead(props) {
    return (
        <GenericTypeahead
            id="log_category"
            labelKey="name"
            onUpdate={props.onUpdate}
            placeholder="Category Name"
            rpcName="log-category-list"
            value={props.logCategory}
        />
    );
}

LogCategoryTypeahead.propTypes = {
    logCategory: PropTypes.Custom.LogCategory.isRequired,
    onUpdate: PropTypes.func.isRequired,
};

export default LogCategoryTypeahead;
