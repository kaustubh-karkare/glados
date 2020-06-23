import { GoPrimitiveDot } from 'react-icons/go';
import { MdAddCircleOutline } from 'react-icons/md';
import { SortableContainer } from 'react-sortable-hoc';
import { TiMinus, TiPlus } from 'react-icons/ti';
import arrayMove from 'array-move';
import Button from 'react-bootstrap/Button';
import InputGroup from 'react-bootstrap/InputGroup';
import Modal from 'react-bootstrap/Modal';
import PropTypes from 'prop-types';
import React from 'react';
import LeftRight from './LeftRight';
import BulletListIcon from './BulletListIcon';
import BulletListItem from './BulletListItem';
import { getDataTypeMapping, isVirtualItem } from '../../data';
import { KeyCodes, debounce } from './Utils';


const WrappedContainer = SortableContainer(({ children }) => <div>{children}</div>);


function AdderWrapper(props) {
    // eslint-disable-next-line react/prop-types
    const { children } = props;
    return (
        <InputGroup size="sm">
            <div className="icon" />
            <div className="icon">
                <GoPrimitiveDot />
            </div>
            <div className="mx-1">
                {children}
            </div>
        </InputGroup>
    );
}

function suppressUnlessShiftKey(event) {
    if (!event.shiftKey) {
        event.preventDefault();
    }
}


class BulletList extends React.Component {
    static getDerivedStateFromProps(props, state) {
        if (state.items) {
            state.areAllExpanded = state.items
                .every((item) => state.isExpanded[item.id]);
        }
        return state;
    }

    constructor(props) {
        super(props);
        this.state = {};
        this.validateItemDebounced = debounce(this.validateItemNotDebounced, 500);
    }

    componentDidMount() {
        this.reload();
    }

    onReorder({ oldIndex, newIndex }) {
        this.setState((state) => ({
            items: arrayMove(state.items, oldIndex, newIndex),
        }));
    }

    onMove(index, delta, event) {
        if (!event.shiftKey) return;
        this.setState((state) => {
            const otherIndex = index + delta;
            if (otherIndex < 0 || otherIndex === state.items.length) return {};
            const items = [...state.items];
            [items[index], items[otherIndex]] = [items[otherIndex], items[index]];
            return { items };
        });
    }

    reload() {
        window.api.send(`${this.props.dataType}-list`)
            .then((items) => {
                this.setState((state) => ({
                    items,
                    isExpanded: state.isExpanded || {},
                }));
            });
    }

    toggleItem(item) {
        this.setState((state) => {
            state.isExpanded[item.id] = !state.isExpanded[item.id];
            return state;
        });
    }

    editItem(item, event) {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        this.setState({ editItem: item });
        this.validateItem(item);
    }

    validateItem(item) {
        this.setState({ validationStatus: 'Pending Validation ...' });
        this.validateItemDebounced(item);
    }

    validateItemNotDebounced(item) {
        this.setState({ validationStatus: 'Validating ...' });
        window.api.send(`${this.props.dataType}-validate`, item)
            .then((validationErrors) => this.setState({ validationStatus: null, validationErrors }))
            .catch((error) => this.setState({ error }));
    }

    saveItem(item) {
        window.api.send(`${this.props.dataType}-upsert`, item)
            .then((savedItem) => {
                this.setState((state) => {
                    if (isVirtualItem(item)) {
                        state.items.push(savedItem);
                        if (state.areAllExpanded) {
                            state.isExpanded[savedItem.id] = true;
                        }
                    } else {
                        const index = state.items
                            .findIndex((existingItem) => existingItem.id === item.id);
                        state.items[index] = savedItem;
                    }
                    state.editItem = null;
                    return state;
                });
            })
            .catch((error) => this.setState({ error }));
    }

    deleteItem(item, event) {
        if (event && !event.shiftKey) {
            this.setState({ deleteItem: item });
            return;
        }
        window.api.send(`${this.props.dataType}-delete`, item.id)
            .then(() => {
                this.setState((state) => {
                    const index = state.items
                        .findIndex((existingItem) => existingItem.id === item.id);
                    state.items.splice(index, 1);
                    delete state.isExpanded[item.id];
                    state.deleteItem = null;
                    return state;
                });
            })
            .catch((error) => this.setState({ error }));
    }

    renderValidationErrors() {
        if (
            this.state.validationErrors
            && this.state.validationErrors.length
        ) {
            return (
                <div style={{ whiteSpace: 'pre-wrap' }}>
                    {this.state.validationErrors.join('\n')}
                </div>
            );
        } if (this.state.validationStatus) {
            return <div>{this.state.validationStatus}</div>;
        }
        return <div>No validation errors!</div>;
    }

    renderEditorModal() {
        if (!this.state.editItem) {
            return null;
        }
        const { EditorComponent } = this.props;
        return (
            <Modal
                show
                onHide={() => this.setState({ editItem: null })}
                onEscapeKeyDown={suppressUnlessShiftKey}
            >
                <Modal.Header closeButton>
                    <Modal.Title>Editor</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <EditorComponent
                        value={this.state.editItem}
                        onChange={(editItem) => {
                            this.setState({ editItem, validationErrors: null });
                            this.validateItem(editItem);
                        }}
                        onSpecialKeys={(event) => {
                            if (!event.shiftKey) return;
                            if (event.keyCode === KeyCodes.ENTER) {
                                this.saveItem(this.state.editItem);
                            } else if (event.keyCode === KeyCodes.ESCAPE) {
                                this.setState({ editItem: null });
                            }
                        }}
                    />
                </Modal.Body>
                <Modal.Body>
                    <LeftRight>
                        {this.renderValidationErrors()}
                        <Button
                            disabled={
                                this.state.validationStatus
                                || (
                                    this.state.validationErrors
                                    && this.state.validationErrors.length
                                )
                            }
                            onClick={() => this.saveItem(this.state.editItem)}
                            size="sm"
                            variant="secondary"
                        >
                            Save
                        </Button>
                    </LeftRight>
                </Modal.Body>
            </Modal>
        );
    }

    renderDeleteConfirmationModal() {
        if (!this.state.deleteItem) {
            return null;
        }
        const { ViewerComponent } = this.props;
        return (
            <Modal
                show
                onHide={() => this.setState({ deleteItem: null })}
                onEscapeKeyDown={suppressUnlessShiftKey}
            >
                <Modal.Header closeButton>
                    <Modal.Title>Confirm deletion?</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <ViewerComponent value={this.state.deleteItem} isExpanded={false} />
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        onClick={() => this.deleteItem(this.state.deleteItem)}
                        size="sm"
                        variant="secondary"
                    >
                        Delete
                    </Button>
                </Modal.Footer>
            </Modal>
        );
    }

    renderErrorModal() {
        if (!this.state.error) {
            return null;
        }
        return (
            <Modal
                show
                onHide={() => this.setState({ error: null })}
                onEscapeKeyDown={suppressUnlessShiftKey}
            >
                <Modal.Header closeButton>
                    <Modal.Title>Error</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <pre>
                        {this.state.error}
                    </pre>
                </Modal.Body>
            </Modal>
        );
    }

    renderListToggleButton() {
        if (this.state.areAllExpanded) {
            return (
                <BulletListIcon
                    title="Collapse All"
                    onClick={() => this.setState({ isExpanded: {} })}
                >
                    <TiMinus />
                </BulletListIcon>
            );
        }
        return (
            <BulletListIcon
                title="Expand All"
                onClick={() => this.setState((state) => ({
                    isExpanded: Object.fromEntries(
                        state.items.map((item) => [item.id, true]),
                    ),
                }))}
            >
                <TiPlus />
            </BulletListIcon>
        );
    }

    renderAddButton() {
        const DataType = getDataTypeMapping()[this.props.dataType];
        return (
            <BulletListIcon
                title="Create New"
                onClick={(event) => this.editItem(DataType.createVirtual(), event)}
            >
                <MdAddCircleOutline />
            </BulletListIcon>
        );
    }

    renderItems() {
        const { ViewerComponent } = this.props;
        return this.state.items.map((item, index) => (
            <BulletListItem
                index={index}
                key={item.id}
                isExpanded={this.state.isExpanded[item.id]}
                onToggleExpansion={() => this.toggleItem(item)}
                onEditButtonClick={(event) => this.editItem(item, event)}
                onDeleteButtonClick={(event) => this.deleteItem(item, event)}
                onMoveUp={(event) => this.onMove(index, -1, event)}
                onMoveDown={(event) => this.onMove(index, 1, event)}
            >
                <ViewerComponent value={item} isExpanded={false} />
                {
                    // eslint-disable-next-line react/forbid-foreign-prop-types
                    ViewerComponent.propTypes.isExpanded
                        ? <ViewerComponent value={item} isExpanded />
                        : null
                }
            </BulletListItem>
        ));
    }

    renderAdder() {
        const { AdderComponent } = this.props;
        if (!AdderComponent) {
            return null;
        }
        return (
            <AdderWrapper>
                <AdderComponent
                    onEdit={(item) => this.editItem(item)}
                    onSave={(item) => this.saveItem(item)}
                />
            </AdderWrapper>
        );
    }

    render() {
        if (!this.state.items) {
            return <div>Loading ...</div>;
        }
        return (
            <div>
                {this.renderEditorModal()}
                {this.renderDeleteConfirmationModal()}
                {this.renderErrorModal()}
                <InputGroup>
                    <div>{this.props.name}</div>
                    {this.renderListToggleButton()}
                    {this.renderAddButton()}
                </InputGroup>
                <WrappedContainer
                    helperClass="sortableDraggedItem"
                    useDragHandle
                    onSortEnd={(data) => this.onReorder(data)}
                >
                    {this.renderItems()}
                </WrappedContainer>
                {this.renderAdder()}
            </div>
        );
    }
}

BulletList.propTypes = {
    name: PropTypes.string.isRequired,
    dataType: PropTypes.string.isRequired,
    EditorComponent: PropTypes.func.isRequired,
    ViewerComponent: PropTypes.func.isRequired,
    AdderComponent: PropTypes.func,
};

export default BulletList;
