import { GrDrag } from 'react-icons/gr';
import InputGroup from 'react-bootstrap/InputGroup';
import React from 'react';
import PropTypes from 'prop-types';
import { SortableContainer, SortableElement, SortableHandle } from 'react-sortable-hoc';

import arrayMove from 'array-move';

const SortableDragHandle = SortableHandle(({ children }) => (
    <InputGroup.Text style={{ cursor: 'grab', padding: '4px' }}>
        <GrDrag />
    </InputGroup.Text>
));

const SortableList = SortableContainer(({ children }) => <div>{children}</div>);

class GenericSortableList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            SortableElementType: SortableElement(this.props.type),
        };
    }

    onReorder({ oldIndex, newIndex }) {
        this.props.onUpdate(arrayMove(this.props.values, oldIndex, newIndex));
    }

    onUpdate(index, logValue) {
        const values = [...this.props.values];
        values[index] = logValue;
        this.props.onUpdate(values);
    }

    onDelete(index) {
        const values = [...this.props.values];
        values.splice(index, 1);
        this.props.onUpdate(values);
    }

    render() {
        const { SortableElementType } = this.state;
        return (
            <SortableList
                useDragHandle
                onSortEnd={(values) => this.onReorder(values)}
            >
                {this.props.values.map((value, index) => React.createElement(
                    SortableElementType,
                    {
                        ...this.props,
                        key: value.id,
                        index, // consumed by SortableElement
                        disabled: !this.props.allowReordering, // consumed by SortableElement
                        sortableListItemIndex: index,
                        [this.props.itemKey]: value,
                        onUpdate: (updatedValue) => this.onUpdate(index, updatedValue),
                        onDelete: (deletedIndex) => this.onDelete(index),
                    },
                ))}
            </SortableList>
        );
    }
}

GenericSortableList.propTypes = {
    allowReordering: PropTypes.bool,
    type: PropTypes.any.isRequired,
    itemKey: PropTypes.string.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    values: PropTypes.arrayOf(PropTypes.any.isRequired).isRequired,
    onUpdate: PropTypes.func.isRequired,
};

export { GenericSortableList, SortableDragHandle };
