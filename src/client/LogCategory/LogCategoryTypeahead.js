import React from 'react';
import PropTypes from '../prop-types';
import { Typeahead } from '../Common';


function LogCategoryTypeahead(props) {
    return (
        <Typeahead
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
