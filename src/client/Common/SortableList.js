import { FaRegTrashAlt } from 'react-icons/fa';
import { GrDrag } from 'react-icons/gr';
import { SortableContainer, SortableElement, SortableHandle } from 'react-sortable-hoc';
import arrayMove from 'array-move';
import Button from 'react-bootstrap/Button';
import PropTypes from 'prop-types';
import React from 'react';


const SortableDragHandle = SortableHandle((props) => (
    <Button
        className="sortableDragHandle"
        disabled={props.disabled}
        size="sm"
        variant="secondary"
    >
        <GrDrag />
    </Button>
));


const WrappedContainer = SortableContainer(({ children }) => <div>{children}</div>);


const WrappedRow = SortableElement((props) => {
    const { children, ...otherProps } = props.original.props;
    return React.createElement(
        props.original.type,
        otherProps,
        [
            <SortableDragHandle
                key="drag"
                disabled={props.handleDisabled}
                title="Reorder"
            />,
            ...children,
            <Button
                key="delete"
                onClick={props.onDelete}
                size="sm"
                title="Delete"
                variant="secondary"
            >
                <FaRegTrashAlt />
            </Button>,
        ],
    );
});


class SortableList extends React.Component {
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
            items, onChange, type, disabled, ...moreProps
        } = this.props;
        return React.createElement(WrappedRow, {
            key: item.id,
            // Consumed by SortableElement
            index,
            disabled: this.props.disabled,
            // Forwarded to the WrappedRow.
            original: this.props.type({
                value: item,
                onChange: (updatedItem) => this.onChange(index, updatedItem),
                ...moreProps,
            }),
            handleDisabled: this.props.disabled,
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
    disabled: PropTypes.bool,
};

SortableList.defaultProps = {
    disabled: false,
};

export default SortableList;
