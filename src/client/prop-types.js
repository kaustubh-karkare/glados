import PropTypes from 'prop-types';

const DateRange = PropTypes.shape({
    startDate: PropTypes.string.isRequired,
    endDate: PropTypes.string.isRequired,
});

const EnumOptions = PropTypes.arrayOf(
    PropTypes.shape({
        value: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
    }).isRequired,
);

const Item = PropTypes.shape({
    __type__: PropTypes.string.isRequired,
    __id__: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
});

const LogTopic = PropTypes.shape({
    __id__: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
});

const LogKey = PropTypes.shape({
    name: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    isOptional: PropTypes.bool,
    parentTopic: LogTopic,
});

const LogStructureGroup = PropTypes.shape({
    __id__: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
});

const LogStructure = PropTypes.shape({
    __id__: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    eventKeys: PropTypes.arrayOf(LogKey.isRequired).isRequired,
});

const LogEvent = PropTypes.shape({
    __id__: PropTypes.number.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    title: PropTypes.object,
    logStructure: LogStructure,
});

const Plugins = PropTypes.objectOf(
    PropTypes.func.isRequired,
);

PropTypes.Custom = {
    DateRange,
    EnumOptions,
    Item,
    LogTopic,
    LogStructureGroup,
    LogKey,
    LogStructure,
    LogEvent,
    Plugins,
};

export default PropTypes;
