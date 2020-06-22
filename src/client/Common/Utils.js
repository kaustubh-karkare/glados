function combineClassNames(map) {
    return Object.entries(map)
        .filter((pair) => pair[1])
        .map((pair) => pair[0])
        .join(' ');
}

// eslint-disable-next-line import/prefer-default-export
export { combineClassNames };
