import { BsList } from 'react-icons/bs';
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
import Dropdown from '../Dropdown';

const SortableDragHandle = SortableHandle(() => (
    <Icon className="sortableDragHandle" title="Reorder">
        <MdFormatLineSpacing />
    </Icon>
));

class BulletListItem extends React.Component {
    constructor(props) {
        super(props);
        this.state = { isHighlighted: false, isExpanded: false };
        this.dropdownRef = React.createRef();
    }

    onEdit(event) {
        if (event) {
            // Don't let enter propagate to EditorModal.
            event.preventDefault();
            event.stopPropagation();
        }
        if (event && event.shiftKey) {
            Coordinator.invoke('url-update', { details: this.props.value });
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
        window.api.send(`${this.props.dataType}-delete`, this.props.value.__id__);
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

    setIsHighlighted(isHighlighted) {
        if (!isHighlighted && this.dropdownRef.current) {
            this.dropdownRef.current.hide();
        }
        this.setState({ isHighlighted });
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
        const isExpanded = this.getIsExpanded();
        const iconProps = {
            alwaysHighlighted: true,
            className: 'mr-1',
            title: isExpanded ? 'Collapse' : 'Expand',
        };
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
        return <MdEdit onClick={(event) => this.onEdit(event)} />;
    }

    renderActionsDropdown() {
        if (!this.state.isHighlighted) {
            return null;
        }
        const actions = [...this.props.prefixActions];
        actions.push({
            __id__: 'delete',
            name: 'Delete',
            perform: (event) => this.onDelete(event),
        });
        actions.push({
            __id__: 'info',
            name: 'Debug Info',
            perform: (event) => Coordinator.invoke(
                'modal-error',
                JSON.stringify(this.props.value, null, 4),
            ),
        });
        return (
            <Dropdown
                disabled={false}
                options={actions}
                onChange={(action, event) => action.perform(event)}
                ref={this.dropdownRef}
            >
                <BsList
                    onMouseOver={() => {
                        if (this.dropdownRef.current) {
                            this.dropdownRef.current.show();
                        }
                    }}
                />
            </Dropdown>
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
        return (
            <ViewerComponent
                {...this.getViewerProps()}
                toggleExpansion={() => this.setIsExpanded(!this.getIsExpanded())}
            />
        );
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
                    onChange={(isHighlighted) => this.setIsHighlighted(isHighlighted)}
                    onKeyDown={(event) => this.onKeyDown(event)}
                >
                    <InputGroup>
                        {this.renderDragHandle()}
                        {this.renderBullet()}
                        <InputLine>{this.renderViewer()}</InputLine>
                        <Icon className="ml-1" title="Edit">
                            {this.renderEditButton()}
                        </Icon>
                        <Icon className="ml-1" title="Actions">
                            {this.renderActionsDropdown()}
                        </Icon>
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
    // eslint-disable-next-line react/forbid-prop-types
    prefixActions: PropTypes.array,

    // The following props are only used by BulletList.
    dragHandleSpace: PropTypes.bool,
    allowReordering: PropTypes.bool,
    onMoveUp: PropTypes.func,
    onMoveDown: PropTypes.func,
    isExpanded: PropTypes.bool,
    setIsExpanded: PropTypes.func,
};

BulletListItem.defaultProps = {
    prefixActions: [],
};

export default BulletListItem;
