import { GoPrimitiveDot } from 'react-icons/go';
import { SortableContainer } from 'react-sortable-hoc';
import arrayMove from 'array-move';
import Button from 'react-bootstrap/Button';
import InputGroup from 'react-bootstrap/InputGroup';
import Modal from 'react-bootstrap/Modal';
import PropTypes from 'prop-types';
import React from 'react';
import BulletListItem from './BulletListItem';
import BulletListTitle from './BulletListTitle';
import { getDataTypeMapping, isVirtualItem } from '../../../data';
import EditorModal from '../EditorModal';
import ErrorModal from '../ErrorModal';


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
    }

    componentDidMount() {
        this.fetchItems();
        this.setupSubscription();
    }

    componentWillUnmount() {
        this.cleanSubscription();
    }

    onMove(index, delta, event) {
        if (!event.shiftKey) return;
        const otherIndex = index + delta;
        const totalLength = this.state.items.length;
        if (otherIndex < 0 || otherIndex === totalLength) return;
        this.onReorder({ oldIndex: index, newIndex: otherIndex });
    }

    onReorder({ oldIndex, newIndex }) {
        if (!this.props.allowReordering) return;
        const orderedItems = arrayMove(this.state.items, oldIndex, newIndex);
        const input = orderedItems.map((item) => item.id);
        window.api.send(`${this.props.dataType}-reorder`, input)
            .then(() => this.setState((state) => ({ items: orderedItems })))
            .catch((error) => this.setState({ error }));
    }

    setupSubscription() {
        if (!this.props.allowSubscription) return;
        const { promise, cancel } = window.api.subscribe(`${this.props.dataType}-list`);
        this.cancelSubscription = cancel;
        promise.then((data) => {
            const original = this.props.selector;
            const modified = (data && data.selector) || {};
            if (Object.keys(original).every((key) => original[key] === modified[key])) {
                this.fetchItems();
            }
            return this.setupSubscription();
        });
    }

    fetchItems() {
        const input = { selector: this.props.selector, ordering: this.props.allowReordering };
        window.api.send(`${this.props.dataType}-list`, input)
            .then((items) => this.setState((state) => ({
                items,
                isExpanded: state.isExpanded || {},
            })));
    }

    cleanSubscription() {
        if (!this.props.allowSubscription) return;
        this.cancelSubscription();
    }

    toggleItem(item) {
        this.setState((state) => {
            state.isExpanded[item.id] = !state.isExpanded[item.id];
            return state;
        });
    }

    editItem(item, event) {
        if (event) {
            // Don't let enter propagate to EditorModal.
            event.preventDefault();
            event.stopPropagation();
        }
        this.setState({ editItem: item });
    }

    saveItem(item) {
        window.api.send(`${this.props.dataType}-upsert`, item)
            .then((savedItem) => {
                this.setState((state) => {
                    if (isVirtualItem(item)) {
                        state.items.push(savedItem);
                        if (state.items.length === 1) {
                            state.isExpanded[savedItem.id] = false;
                        } else if (state.areAllExpanded) {
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
                    <ViewerComponent value={this.state.deleteItem} />
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

    renderItems() {
        const { ViewerComponent, ExpandedViewerComponent } = this.props;
        return this.state.items.map((item, index) => (
            <BulletListItem
                index={index}
                key={item.id}
                allowReordering={this.props.allowReordering}
                isExpanded={this.state.isExpanded[item.id]}
                onToggleButtonClick={() => this.toggleItem(item)}
                onEditButtonClick={(event) => this.editItem(item, event)}
                onDeleteButtonClick={(event) => this.deleteItem(item, event)}
                onMoveUp={(event) => this.onMove(index, -1, event)}
                onMoveDown={(event) => this.onMove(index, 1, event)}
            >
                <ViewerComponent value={item} />
                {
                    ExpandedViewerComponent
                        ? <ExpandedViewerComponent value={item} />
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
                    selector={this.props.selector}
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
        const DataType = getDataTypeMapping()[this.props.dataType];
        return (
            <div>
                <EditorModal
                    dataType={this.props.dataType}
                    EditorComponent={this.props.EditorComponent}
                    editorProps={{ selector: this.props.selector }}
                    value={this.state.editItem}
                    onChange={(editItem) => this.setState({ editItem })}
                    onSave={() => this.saveItem(this.state.editItem)}
                    onError={(error) => this.setState({ error })}
                />
                {this.renderDeleteConfirmationModal()}
                <ErrorModal
                    error={this.state.error}
                    onClose={() => this.setState({ error: null })}
                />
                <BulletListTitle
                    name={this.props.name}
                    areAllExpanded={this.state.areAllExpanded}
                    onToggleButtonClick={() => this.setState((state) => {
                        if (state.areAllExpanded) {
                            return { isExpanded: {} };
                        }
                        return {
                            isExpanded: Object.fromEntries(
                                state.items.map((item) => [item.id, true]),
                            ),
                        };
                    })}
                    onAddButtonClick={(event) => this.editItem(
                        DataType.createVirtual(this.props.selector),
                        event,
                    )}
                />
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
    // eslint-disable-next-line react/forbid-prop-types
    selector: PropTypes.object,
    allowReordering: PropTypes.bool,
    allowSubscription: PropTypes.bool,
    ViewerComponent: PropTypes.func.isRequired,
    ExpandedViewerComponent: PropTypes.func,
    EditorComponent: PropTypes.func.isRequired,
    AdderComponent: PropTypes.func,
};

export default BulletList;
