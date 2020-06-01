import PropTypes from 'prop-types';
import LogKeyTypes from '../common/log_key_types';

const LogKeyType = PropTypes.oneOf(
    Object.values(LogKeyTypes).map(item => item.value)
);

const LogKey = PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    type: LogKeyType.isRequired,
});

const LogCategory = PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    logKeys: PropTypes.arrayOf(LogKey.isRequired),
});

PropTypes.Custom = {LogKeyType, LogKey, LogCategory};
export default PropTypes;
