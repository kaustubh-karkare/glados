import PropTypes from 'prop-types';
import React from 'react';

function TextEditorMention(props) {
    const item = props.mention;
    return <span className="mention" title={item.name}>{props.children}</span>;
}

TextEditorMention.propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    mention: PropTypes.any.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    children: PropTypes.any,
};

export default TextEditorMention;
