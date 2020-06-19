import PropTypes from 'prop-types';
import { getLogKeyTypes } from '../common/LogKey';

const LogKeyType = PropTypes.oneOf(
    getLogKeyTypes().map((item) => item.value),
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

const LogEntry = PropTypes.shape({
    id: PropTypes.number.isRequired,
    title: PropTypes.string.isRequired,
    logCategory: LogCategory,
    logValues: PropTypes.arrayOf(LogValue.isRequired).isRequired,
});

PropTypes.Custom = {
    LogKeyType, LogKey, LogCategory, LogValue, LogEntry,
};
export default PropTypes;
