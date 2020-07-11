import PropTypes from 'prop-types';

const LogStructureKey = PropTypes.arrayOf(
    PropTypes.shape({
        name: PropTypes.string.isRequired,
        type: PropTypes.string.isRequired,
    }).isRequired,
);

const LogStructure = PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    logKeys: LogStructureKey.isRequired,
});

const LogTopic = PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
});

const LogEvent = PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    logStructure: LogStructure,
});

const LogReminder = PropTypes.shape({
    parentLogTopic: LogTopic.isRequired,
    deadline: PropTypes.string,
    warning: PropTypes.string,
    frequency: PropTypes.string,
    lastUpdate: PropTypes.string,
});

PropTypes.Custom = {
    LogTopic,
    LogStructureKey,
    LogStructure,
    LogReminder,
    LogEvent,
};
export default PropTypes;
