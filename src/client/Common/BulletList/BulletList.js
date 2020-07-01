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
import DataLoader from '../DataLoader';
import EditorModal from '../EditorModal';
import ErrorModal from '../ErrorModal';
import { getDataTypeMapping } from '../../../data';


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
        this.dataLoader = new DataLoader({
            name: `${this.props.dataType}-list`,
            args: {
                selector: this.props.selector,
                ordering: this.props.allowReordering,
            },
            callback: (items) => this.setState((state) => ({
                items,
                isExpanded: state.isExpanded || {},
            })),
        });
    }

    componentWillUnmount() {
        this.dataLoader.stop();
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
        const input = {
            dataType: this.props.dataType,
            selector: this.props.selector,
            ordering: orderedItems.map((item) => item.id),
        };
        window.api.send(`${this.props.dataType}-reorder`, input)
            .then(() => this.setState({ items: orderedItems }))
            .catch((error) => this.setState({ error }));
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
        this.setState({ isSaving: true });
        const { editItem } = this.state;
        window.api.send(`${this.props.dataType}-upsert`, editItem || item)
            .then((updatedItem) => this.setState((state) => ({
                isSaving: false,
                editItem: editItem ? updatedItem : null,
            })))
            .catch((error) => this.setState({ isSaving: false, error }));
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
                    isSaving={this.state.isSaving}
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
                        DataType.createVirtual(
                            this.props.creator ? this.props.creator : this.props.selector,
                        ),
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
    // eslint-disable-next-line react/forbid-prop-types
    creator: PropTypes.object,
    allowReordering: PropTypes.bool,
    ViewerComponent: PropTypes.func.isRequired,
    ExpandedViewerComponent: PropTypes.func,
    EditorComponent: PropTypes.func.isRequired,
    AdderComponent: PropTypes.func,
};

export default BulletList;
