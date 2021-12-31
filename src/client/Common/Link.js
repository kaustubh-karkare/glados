import assert from 'assert';
import React from 'react';

import PropTypes from '../prop-types';
import Coordinator from './Coordinator';

function Link(props) {
    const { logStructure, logTopic } = props;
    assert(!(logStructure && logTopic));
    const item = logStructure || logTopic;
    assert(item);

    let link;
    try {
        link = Coordinator.invoke('url-link', { details: item });
    } catch (error) {
        link = '#';
    }
    return (
        <a
            className="topic"
            title={item.name}
            href={link}
            tabIndex={-1}
            onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                Coordinator.invoke('url-update', { details: item });
            }}
        >
            {props.children}
        </a>
    );
}

Link.propTypes = {
    logStructure: PropTypes.Custom.LogStructure,
    logTopic: PropTypes.Custom.LogTopic,
    // eslint-disable-next-line react/forbid-prop-types
    children: PropTypes.any,
};

export default Link;
