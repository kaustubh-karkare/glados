import React from 'react';
import PropTypes from '../prop-types';
import Coordinator from './Coordinator';

function Link(props) {
    const { logTopic } = props;
    const linkHref = Coordinator.invoke('link-href', { activeDetails: logTopic });
    return (
        <a
            className="topic"
            title={logTopic.name}
            href={linkHref}
            tabIndex={-1}
            onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                Coordinator.invoke('details', logTopic);
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
