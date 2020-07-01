import PropTypes from 'prop-types';
// eslint-disable-next-line import/no-named-default
import { default as LogKeyClass } from '../data/LogKey';

const LogKeyType = PropTypes.oneOf(
    LogKeyClass.getTypes().map((item) => item.value),
);

const LogKey = PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    type: LogKeyType.isRequired,
});

const LogStructure = PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    logKeys: PropTypes.arrayOf(LogKey.isRequired).isRequired,
});

const LogValue = PropTypes.shape({
    id: PropTypes.number.isRequired,
    logKey: LogKey.isRequired,
    data: PropTypes.string.isRequired,
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

const LogEntry = PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    logStructure: LogStructure,
    logValues: PropTypes.arrayOf(LogValue.isRequired).isRequired,
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
    LogStructure,
    LogKeyType,
    LogKey,
    LogValue,
    LogReminderGroup,
    LogReminder,
    LogEntry,
};
export default PropTypes;
