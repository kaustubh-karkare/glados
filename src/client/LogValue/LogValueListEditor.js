import React from 'react';
import arrayMove from 'array-move';
import LogValueEditor from './LogValueEditor';
import PropTypes from '../prop-types';
import { SortableElement, SortableList } from '../Sortable.react';

const LogValueEditorSortableItem = SortableElement(LogValueEditor);

class LogValueListEditor extends React.Component {
    onReorder({ oldIndex, newIndex }) {
        this.props.onUpdate(arrayMove(this.props.logValues, oldIndex, newIndex));
    }

    onUpdate(index, logValue) {
        const logValues = [...this.props.logValues];
        logValues[index] = logValue;
        this.props.onUpdate(logValues);
    }

    onDelete(index) {
        const logValues = [...this.props.logValues];
        logValues.splice(index, 1);
        this.props.onUpdate(logValues);
    }

    render() {
        return (
            <SortableList
                useDragHandle
                onSortEnd={(data) => this.onReorder(data)}
            >
                {this.props.logValues.map((logValue, index) => (
                    <LogValueEditorSortableItem
                        key={logValue.id}
                        index={index}
                        logValue={logValue}
                        onUpdate={(updatedLogValue) => this.onUpdate(index, updatedLogValue)}
                        onDelete={(deletedIndex) => this.onDelete(deletedIndex)}
                    />
                ))}
            </SortableList>
        );
    }
}

LogValueListEditor.propTypes = {
    logValues: PropTypes.arrayOf(PropTypes.Custom.LogValue.isRequired).isRequired,
    onUpdate: PropTypes.func.isRequired,
};

export default LogValueListEditor;
