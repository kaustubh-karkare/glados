import PropTypes from 'prop-types';
// eslint-disable-next-line import/no-named-default
import { default as LogKeyClass } from '../common/LogKey';
// eslint-disable-next-line import/no-named-default
import { default as LogTagClass } from '../common/LogTag';

const LogKeyType = PropTypes.oneOf(
    LogKeyClass.getTypes().map((item) => item.value),
);

const LogKey = PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    type: LogKeyType.isRequired,
});

const LogCategory = PropTypes.shape({
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
    logCategory: LogCategory,
    logValues: PropTypes.arrayOf(LogValue.isRequired).isRequired,
});

PropTypes.Custom = {
    LogKeyType, LogKey, LogCategory, LogValue, LogTag, LogEntry,
};
export default PropTypes;
