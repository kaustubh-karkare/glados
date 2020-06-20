
function extractLogTags(value) {
    const logTags = {};
    if (value) {
        const editorContent = JSON.parse(value);
        Object.values(editorContent.entityMap)
            .filter((entity) => entity.type === 'mention' || entity.type === '#mention')
            .forEach((entity) => {
                const logTag = entity.data.mention;
                logTags[logTag.id] = logTag;
            });
    }
    return Object.values(logTags);
}

export default extractLogTags;
