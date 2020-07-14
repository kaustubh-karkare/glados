import PropTypes from 'prop-types';

const LogTopic = PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
});

const LogStructureKey = PropTypes.arrayOf(
    PropTypes.shape({
        name: PropTypes.string.isRequired,
        type: PropTypes.string.isRequired,
    }).isRequired,
);

const LogStructureGroup = PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
});

const LogStructure = PropTypes.shape({
    id: PropTypes.number.isRequired,
    logTopic: LogTopic.isRequired,
    logKeys: LogStructureKey.isRequired,
});

const LogEvent = PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    logStructure: LogStructure,
});

PropTypes.Custom = {
    LogTopic,
    LogStructureGroup,
    LogStructureKey,
    LogStructure,
    LogEvent,
};
export default PropTypes;
