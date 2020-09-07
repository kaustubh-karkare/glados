import PropTypes from 'prop-types';

const DateRange = PropTypes.shape({
    startDate: PropTypes.string.isRequired,
    endDate: PropTypes.string.isRequired,
});

const Item = PropTypes.shape({
    __type__: PropTypes.string.isRequired,
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
});

const LogMode = PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
});

const LogTopic = PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
});

const LogStructureKey = PropTypes.shape({
    name: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    isOptional: PropTypes.bool,
    parentTopic: LogTopic,
});

const LogStructureGroup = PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
});

const LogStructure = PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    logKeys: PropTypes.arrayOf(LogStructureKey.isRequired).isRequired,
});

const LogEvent = PropTypes.shape({
    id: PropTypes.number.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    title: PropTypes.object,
    logStructure: LogStructure,
});

PropTypes.Custom = {
    DateRange,
    Item,
    LogMode,
    LogTopic,
    LogStructureGroup,
    LogStructureKey,
    LogStructure,
    LogEvent,
};
export default PropTypes;
