import { GoPrimitiveDot } from 'react-icons/go';
import { SortableContainer, SortableElement } from 'react-sortable-hoc';
import arrayMove from 'array-move';
import InputGroup from 'react-bootstrap/InputGroup';
import PropTypes from 'prop-types';
import React from 'react';
import BulletListItem from './BulletListItem';
import BulletListTitle from './BulletListTitle';
import DataLoader from '../DataLoader';
import { getDataTypeMapping } from '../../../data';


const WrappedContainer = SortableContainer(({ children }) => <div>{children}</div>);
const SortableBulletListItem = SortableElement(BulletListItem);


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
        this.state = { items: null, isExpanded: {} };
    }

    componentDidMount() {
        this.dataLoader = new DataLoader({
            getInput: () => ({
                name: `${this.props.dataType}-list`,
                args: { where: this.props.where },
            }),
            callback: (items) => this.setState({ items }),
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
        const value = DataType.createVirtual(this.props.where);
        const context = { ...this };
        context.props = { ...context.props, value };
        BulletListItem.prototype.onEdit.call(context, event);
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

    renderItems() {
        return this.state.items.map((item, index) => (
            <SortableBulletListItem
                index={index}
                key={item.id}
                dataType={this.props.dataType}
                valueKey={this.props.valueKey}
                ViewerComponent={this.props.ViewerComponent}
                viewerComponentProps={this.props.viewerComponentProps}
                EditorComponent={this.props.EditorComponent}
                allowReordering={this.props.allowReordering}
                onMoveUp={(event) => this.onMove(index, -1, event)}
                onMoveDown={(event) => this.onMove(index, 1, event)}
                isExpanded={this.state.isExpanded[item.id] || false}
                setIsExpanded={(isExpanded) => this.setState((state) => {
                    state.isExpanded[item.id] = isExpanded;
                    return state;
                })}
                value={item}
                dragHandleSpace
            />
        ));
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
    allowCreation: PropTypes.bool,
    allowReordering: PropTypes.bool,
    ViewerComponent: PropTypes.func.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    viewerComponentProps: PropTypes.object,
    EditorComponent: PropTypes.func.isRequired,
    AdderComponent: PropTypes.func,
};

BulletList.defaultProps = {
    allowCreation: true,
};

BulletList.Item = BulletListItem;

export default BulletList;
