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

const LogTopicGroup = PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
});

const LogTopic = PropTypes.shape({
    id: PropTypes.number.isRequired,
    logTopicGroup: LogTopicGroup.isRequired,
    name: PropTypes.string.isRequired,
});

const LogEvent = PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    logStructure: LogStructure,
});

const LogReminderGroup = PropTypes.shape({
    name: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
});

const LogReminder = PropTypes.shape({
    logReminderGroup: LogReminderGroup.isRequired,
    deadline: PropTypes.string,
    warning: PropTypes.string,
    frequency: PropTypes.string,
    lastUpdate: PropTypes.string,
});

PropTypes.Custom = {
    LogTopicGroup,
    LogTopic,
    LogStructureKey,
    LogStructure,
    LogReminderGroup,
    LogReminder,
    LogEvent,
};
export default PropTypes;
