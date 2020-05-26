import PropTypes from 'prop-types';
import LSDValueTypes from '../common/lsd_value_types';

const LSDValueType = PropTypes.oneOf(
    Object.values(LSDValueTypes).map(item => item.value)
);

const LSDKey = PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    value_type: LSDValueType.isRequired,
});

const Category = PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    lsd_keys: PropTypes.arrayOf(LSDKey.isRequired),
});

PropTypes.Custom = {LSDValueType, LSDKey, Category};
export default PropTypes;
