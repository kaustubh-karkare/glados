import PropTypes from 'prop-types';
// eslint-disable-next-line import/no-named-default
import { default as LogKeyClass } from '../data/LogKey';
// eslint-disable-next-line import/no-named-default
import { default as LogTagClass } from '../data/LogTag';

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

const LogTagType = PropTypes.oneOf(
    LogTagClass.getTypes().map((item) => item.value),
);

const LogTag = PropTypes.shape({
    id: PropTypes.number.isRequired,
    type: LogTagType.isRequired,
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
});

const LogReminder = PropTypes.shape({
    type: PropTypes.string.isRequired,
    deadline: PropTypes.string,
    warning: PropTypes.string,
    frequency: PropTypes.string,
    lastUpdate: PropTypes.string,
});

PropTypes.Custom = {
    LogKeyType,
    LogKey,
    LogStructure,
    LogValue,
    LogTag,
    LogEntry,
    LogReminderGroup,
    LogReminder,
};
export default PropTypes;
