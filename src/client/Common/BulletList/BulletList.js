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
import Coordinator from '../Coordinator';
import DataLoader from '../DataLoader';
import EditorModal from '../EditorModal';
import { getDataTypeMapping } from '../../../data';


const WrappedContainer = SortableContainer(({ children }) => <div>{children}</div>);


function AdderWrapper(props) {
    // eslint-disable-next-line react/prop-types
    const { children } = props;
    return (
        <InputGroup>
            <div className="icon" />
            <div className="icon mr-1">
                <GoPrimitiveDot />
            </div>
            {children}
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
            getInput: () => ({
                name: `${this.props.dataType}-list`,
                args: {
                    where: this.props.where,
                    ordering: this.props.allowReordering,
                },
            }),
            callback: (items) => this.setState((state) => ({
                items,
                isExpanded: state.isExpanded || {},
            })),
        });
    }

    componentDidUpdate() {
        this.dataLoader.reload();
    }

    componentWillUnmount() {
        this.dataLoader.stop();
    }

    onAddButtonClick(event) {
        const DataType = getDataTypeMapping()[this.props.dataType];
        const newItem = DataType.createVirtual(this.props.creator || this.props.where);
        this.onEdit(newItem, event);
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
            where: this.props.where,
            ordering: orderedItems.map((item) => item.id),
        };
        window.api.send(`${this.props.dataType}-reorder`, input)
            .then(() => this.setState({ items: orderedItems }));
    }

    onToggle(item) {
        this.setState((state) => {
            state.isExpanded[item.id] = !state.isExpanded[item.id];
            return state;
        });
    }

    onEdit(item, event) {
        if (event) {
            // Don't let enter propagate to EditorModal.
            event.preventDefault();
            event.stopPropagation();
        }
        Coordinator.invoke('modal', EditorModal, {
            dataType: this.props.dataType,
            EditorComponent: this.props.EditorComponent,
            valueKey: this.props.valueKey,
            value: item,
        });
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
            });
    }

    renderDeleteConfirmationModal() {
        if (!this.state.deleteItem) {
            return null;
        }
        const { ViewerComponent } = this.props;
        const viewerComponentProps = {
            [this.props.valueKey]: this.state.deleteItem,
            ...this.props.viewerComponentProps,
        };
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
                    <ViewerComponent {...viewerComponentProps} />
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={() => this.deleteItem(this.state.deleteItem)}>
                        Delete
                    </Button>
                </Modal.Footer>
            </Modal>
        );
    }

    renderItems() {
        const { ViewerComponent } = this.props;
        return this.state.items.map((item, index) => {
            const viewerComponentProps = {
                [this.props.valueKey]: item,
                ...this.props.viewerComponentProps,
            };
            return (
                <BulletListItem
                    index={index}
                    key={item.id}
                    allowReordering={this.props.allowReordering}
                    isExpanded={this.state.isExpanded[item.id]}
                    onToggleButtonClick={() => this.onToggle(item)}
                    onEditButtonClick={(event) => this.onEdit(item, event)}
                    onDeleteButtonClick={(event) => this.deleteItem(item, event)}
                    onMoveUp={(event) => this.onMove(index, -1, event)}
                    onMoveDown={(event) => this.onMove(index, 1, event)}
                >
                    <ViewerComponent {...viewerComponentProps} />
                    {
                        ViewerComponent.Expanded
                            ? <ViewerComponent.Expanded {...viewerComponentProps} />
                            : null
                    }
                </BulletListItem>
            );
        });
    }

    renderAdder() {
        const { AdderComponent } = this.props;
        if (!AdderComponent) {
            return null;
        }
        return (
            <AdderWrapper>
                <AdderComponent where={this.props.where} />
            </AdderWrapper>
        );
    }

    render() {
        if (!this.state.items) {
            return <div>Loading ...</div>;
        }
        return (
            <div>
                {this.renderDeleteConfirmationModal()}
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
                    onAddButtonClick={this.props.allowCreation
                        ? (event) => this.onAddButtonClick(event)
                        : null}
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
    valueKey: PropTypes.string.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    where: PropTypes.object,
    // eslint-disable-next-line react/forbid-prop-types
    creator: PropTypes.object,
    allowCreation: PropTypes.bool,
    allowReordering: PropTypes.bool,
    ViewerComponent: PropTypes.func.isRequired,
    EditorComponent: PropTypes.func.isRequired,
    AdderComponent: PropTypes.func,
    // eslint-disable-next-line react/forbid-prop-types
    viewerComponentProps: PropTypes.object,
};

BulletList.defaultProps = {
    allowCreation: true,
};

export default BulletList;
