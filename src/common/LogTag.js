
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

class LogTag {
    static getTypes() {
        return Object.keys(LogTagTypes).map(
            (type) => ({ ...LogTagTypes[type], value: type }),
        );
    }
}

export default LogTag;
