import React from 'react';
import PropTypes from '../prop-types';
import Coordinator from './Coordinator';

function Link(props) {
    const { logTopic } = props;
    let link;
    try {
        link = Coordinator.invoke('url-link', { details: logTopic });
    } catch (error) {
        link = '#';
    }
    return (
        <a
            className="topic"
            title={logTopic.name}
            href={link}
            tabIndex={-1}
            onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                Coordinator.invoke('url-update', { details: logTopic });
            }}
        >
            {props.children}
        </a>
    );
}

Link.propTypes = {
    logTopic: PropTypes.Custom.LogTopic.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    children: PropTypes.any,
};

export default Link;
