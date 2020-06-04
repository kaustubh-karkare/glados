import React from 'react';
import arrayMove from 'array-move';
import PropTypes from '../prop-types';
import { SortableElement, SortableList } from '../Sortable.react';

import LogKeyEditor from './LogKeyEditor';

const LogKeyEditorSortableItem = SortableElement(LogKeyEditor);

class LogKeyListEditor extends React.Component {
    onReorder({ oldIndex, newIndex }) {
        this.props.onUpdate(arrayMove(this.props.logKeys, oldIndex, newIndex));
    }

    onUpdate(index, logKey) {
        const logKeys = [...this.props.logKeys];
        logKeys[index] = logKey;
        this.props.onUpdate(logKeys);
    }

    onDelete(index) {
        const logKeys = [...this.props.logKeys];
        logKeys.splice(index, 1);
        this.props.onUpdate(logKeys);
    }

    filterBy(index, option) {
        const logKey = this.props.logKeys[index];
        return (
            this.props.logKeys
                .filter((_, itemIndex) => (index !== itemIndex))
                .every((otherLogKey) => option.id !== otherLogKey.id)
            && option.name.includes(logKey.name)
        );
    }

    render() {
        return (
            <SortableList
                useDragHandle
                onSortEnd={(data) => this.onReorder(data)}
            >
                {this.props.logKeys.map((logKey, index) => (
                    <LogKeyEditorSortableItem
                        key={logKey.id}
                        index={index}
                        logKey={logKey}
                        allowEditing
                        filterBy={(option) => this.filterBy(index, option)}
                        onUpdate={(updatedLogKey) => this.onUpdate(index, updatedLogKey)}
                        onDelete={(deletedLogKey) => this.onDelete(index, deletedLogKey)}
                    />
                ))}
            </SortableList>
        );
    }
}

LogKeyListEditor.propTypes = {
    logKeys: PropTypes.arrayOf(PropTypes.Custom.LogKey.isRequired).isRequired,
    onUpdate: PropTypes.func.isRequired,
};

export default LogKeyListEditor;
