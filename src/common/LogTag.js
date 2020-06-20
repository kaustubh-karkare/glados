
import assert from './assert';

const LogTagTypes = {
    person: {
        label: 'Person',
        trigger: '@',
        prefix: '',
    },
    hashtag: {
        label: 'Hashtag',
        trigger: '#',
        prefix: '#',
    },
};

function getLogTagTypes() {
    return Object.keys(LogTagTypes).map(
        (type) => ({ ...LogTagTypes[type], value: type }),
    );
}

function getLogTagType(typeOrTrigger) {
    let logTagType = LogTagTypes[typeOrTrigger];
    if (!logTagType) {
        logTagType = getLogTagTypes().find((item) => item.trigger === typeOrTrigger);
    }
    assert(logTagType);
    return logTagType;
}

export { getLogTagType, getLogTagTypes };
