import { FaRegTrashAlt } from 'react-icons/fa';
import { GoPrimitiveDot } from 'react-icons/go';
import { MdFormatLineSpacing, MdEdit } from 'react-icons/md';
import { SortableHandle } from 'react-sortable-hoc';
import { TiMinus, TiPlus } from 'react-icons/ti';
import InputGroup from 'react-bootstrap/InputGroup';
import PropTypes from 'prop-types';
import React from 'react';
import Coordinator from '../Coordinator';
import { KeyCodes } from '../Utils';
import Highlightable from '../Highlightable';
import Icon from '../Icon';
import InputLine from '../InputLine';


const SortableDragHandle = SortableHandle(() => (
    <Icon className="sortableDragHandle">
        <MdFormatLineSpacing />
    </Icon>
));


class BulletListItem extends React.Component {
    constructor(props) {
        super(props);
        this.state = { isHighlighted: false, isExpanded: false };
    }

    onEdit(event) {
        if (event) {
            // Don't let enter propagate to EditorModal.
            event.preventDefault();
            event.stopPropagation();
        }
        if (event && event.shiftKey) {
            Coordinator.invoke('details', this.props.value);
            return;
        }
        Coordinator.invoke('modal-editor', {
            dataType: this.props.dataType,
            EditorComponent: this.props.EditorComponent,
            valueKey: this.props.valueKey,
            value: this.props.value,
        });
    }

    onDelete(event) {
        if (event) {
            // Don't let enter propagate to ConfirmationModal.
            event.preventDefault();
            event.stopPropagation();
        }
        if (event && !event.shiftKey) {
            Coordinator.invoke('modal-confirm', {
                title: 'Confirm deletion?',
                body: this.renderViewer(),
                onClose: (result) => {
                    if (result) this.onDelete();
                },
            });
            return;
        }
        window.api.send(`${this.props.dataType}-delete`, this.props.value.id);
    }

    onKeyDown(event) {
        if (event.keyCode === KeyCodes.SPACE) {
            this.setIsExpanded(!this.getIsExpanded());
        } else if (event.keyCode === KeyCodes.ENTER) {
            this.onEdit(event);
        } else if (event.keyCode === KeyCodes.DELETE) {
            this.onDelete(event);
        } else if (event.keyCode === KeyCodes.UP_ARROW) {
            if (this.props.allowReordering) this.props.onMoveUp(event);
        } else if (event.keyCode === KeyCodes.DOWN_ARROW) {
            if (this.props.allowReordering) this.props.onMoveDown(event);
        }
    }

    getIsExpanded() {
        if (typeof this.props.isExpanded !== 'undefined') {
            return this.props.isExpanded;
        }
        return this.state.isExpanded;
    }

    setIsExpanded(isExpanded) {
        if (typeof this.props.isExpanded !== 'undefined') {
            this.props.setIsExpanded(isExpanded);
        } else {
            this.setState({ isExpanded });
        }
    }

    getViewerProps() {
        return { [this.props.valueKey]: this.props.value, ...this.props.viewerComponentProps };
    }

    renderDragHandle() {
        if (!this.props.dragHandleSpace) return null;
        if (this.state.isHighlighted && this.props.allowReordering) return <SortableDragHandle />;
        return <Icon />;
    }

    renderBullet() {
        const iconProps = {
            alwaysHighlighted: true,
            className: 'mr-1',
        };
        const isExpanded = this.getIsExpanded();
        if (this.state.isHighlighted) {
            return (
                <Icon {...iconProps} onClick={() => this.setIsExpanded(!isExpanded)}>
                    {isExpanded ? <TiMinus /> : <TiPlus />}
                </Icon>
            );
        }
        return (
            <Icon {...iconProps}>
                {isExpanded ? <TiMinus /> : <GoPrimitiveDot />}
            </Icon>
        );
    }

    renderEditButton() {
        if (!this.state.isHighlighted) {
            return null;
        }
        return (
            <Icon
                className="ml-1"
                title="Edit"
                onClick={(event) => this.onEdit(event)}
            >
                <MdEdit />
            </Icon>
        );
    }

    renderDeleteButton() {
        if (!this.state.isHighlighted) {
            return null;
        }
        return (
            <Icon
                className="ml-1"
                title="Delete"
                onClick={(event) => this.onDelete(event)}
            >
                <FaRegTrashAlt />
            </Icon>
        );
    }

    renderExpanded() {
        if (!this.getIsExpanded()) {
            return null;
        }
        // 13 = width of 1 icon. 4 = margin right of bullet icon
        const marginLeft = 13 * (this.props.dragHandleSpace ? 2 : 1) + 4;
        return (
            <div style={{ marginLeft }}>
                {this.renderExpandedViewer()}
            </div>
        );
    }

    renderViewer() {
        const { ViewerComponent } = this.props;
        return <ViewerComponent {...this.getViewerProps()} />;
    }

    renderExpandedViewer() {
        const { ViewerComponent } = this.props;
        if (ViewerComponent.Expanded) {
            return <ViewerComponent.Expanded {...this.getViewerProps()} />;
        }
        return null;
    }

    render() {
        return (
            <>
                <Highlightable
                    isHighlighted={this.state.isHighlighted}
                    onChange={(isHighlighted) => this.setState({ isHighlighted })}
                    onKeyDown={(event) => this.onKeyDown(event)}
                >
                    <InputGroup>
                        {this.renderDragHandle()}
                        {this.renderBullet()}
                        <InputLine>{this.renderViewer()}</InputLine>
                        {this.renderEditButton()}
                        {this.renderDeleteButton()}
                    </InputGroup>
                </Highlightable>
                {this.renderExpanded()}
            </>
        );
    }
}

BulletListItem.propTypes = {
    dataType: PropTypes.string.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    value: PropTypes.object.isRequired,
    valueKey: PropTypes.string.isRequired,
    ViewerComponent: PropTypes.func.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    viewerComponentProps: PropTypes.object,
    EditorComponent: PropTypes.func.isRequired,

    // The following props are only used by BulletList.
    dragHandleSpace: PropTypes.bool,
    allowReordering: PropTypes.bool,
    onMoveUp: PropTypes.func,
    onMoveDown: PropTypes.func,
    isExpanded: PropTypes.bool,
    setIsExpanded: PropTypes.func,
};

export default BulletListItem;
