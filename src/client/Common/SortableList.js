import { GoTrashcan } from 'react-icons/go';
import { GrDrag } from 'react-icons/gr';
import { SortableContainer, SortableElement, SortableHandle } from 'react-sortable-hoc';
import arrayMove from 'array-move';
import Button from 'react-bootstrap/Button';
import PropTypes from 'prop-types';
import React from 'react';


import './SortableList.css';

const SortableDragHandle = SortableHandle((props) => (
    <Button
        className="sortableDragHandle"
        disabled={props.disabled}
    >
        <GrDrag />
    </Button>
));


const WrappedContainer = SortableContainer(({ children }) => <div>{children}</div>);


const WrappedRow = SortableElement((props) => {
    const disabled = props.wrappedRowDisabled;
    const { children, ...otherProps } = props.originalElement.props;
    return React.createElement(
        props.originalElement.type,
        otherProps,
        [
            <SortableDragHandle
                key="drag"
                disabled={disabled}
                title="Reorder"
            />,
            ...(children || []),
            <Button
                key="delete"
                disabled={disabled}
                onClick={props.onDelete}
                title="Delete"
            >
                <GoTrashcan />
            </Button>,
        ],
    );
});


class SortableList extends React.Component {
    constructor(props) {
        super(props);
        let { type } = props;
        if (type.constructor) {
            type = (innerProps) => React.createElement(props.type, innerProps);
        }
        this.state = { type };
    }

    onReorder({ oldIndex, newIndex }) {
        this.props.onChange(arrayMove(this.props.items, oldIndex, newIndex));
    }

    onChange(index, item) {
        const items = [...this.props.items];
        items[index] = item;
        this.props.onChange(items);
    }

    onDelete(index) {
        const items = [...this.props.items];
        items.splice(index, 1);
        this.props.onChange(items);
    }

    renderRow(item, index) {
        const {
            items: _items, onChange: _onChange, type: _type, valueKey, disabled, ...moreProps
        } = this.props;
        return React.createElement(WrappedRow, {
            key: item.id,
            // Consumed by SortableElement
            index,
            disabled,
            // Forwarded to the WrappedRow.
            originalElement: this.state.type({
                [valueKey]: item,
                disabled,
                onChange: (updatedItem) => this.onChange(index, updatedItem),
                index,
                ...moreProps,
            }),
            wrappedRowDisabled: disabled,
            onDelete: () => this.onDelete(index),
        });
    }

    render() {
        return (
            <WrappedContainer
                helperClass="sortableDraggedItem"
                useDragHandle
                onSortEnd={(data) => this.onReorder(data)}
            >
                {this.props.items.map((item, index) => this.renderRow(item, index))}
            </WrappedContainer>
        );
    }
}

SortableList.propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    items: PropTypes.arrayOf(PropTypes.any.isRequired).isRequired,
    onChange: PropTypes.func.isRequired,
    type: PropTypes.func.isRequired,
    valueKey: PropTypes.string.isRequired,
    disabled: PropTypes.bool.isRequired,
};

export default SortableList;
