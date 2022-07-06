import './BulletList.css';

import arrayMove from 'array-move';
import classNames from 'classnames';
import deepEqual from 'deep-equal';
import PropTypes from 'prop-types';
import React from 'react';
import { SortableContainer, SortableElement } from 'react-sortable-hoc';

import { getDataTypeMapping } from '../../../common/data_types';
import DataLoader from '../DataLoader';
import SettingsContext from '../SettingsContext';
import BulletListItem from './BulletListItem';
import BulletListLine from './BulletListLine';
import BulletListPager from './BulletListPager';
import BulletListTitle from './BulletListTitle';

const WrappedContainer = SortableContainer(({ children }) => <div>{children}</div>);
const SortableBulletListItem = SortableElement(BulletListItem);

class BulletList extends React.Component {
    static getDerivedStateFromProps(props, state) {
        if (state.items) {
            state.areAllExpanded = state.items
                .every((item) => state.isExpanded[item.__id__]);
        }
        return state;
    }

    constructor(props) {
        super(props);
        const pageSize = parseInt(props.settings.bullet_list_page_size, 10) || 25;
        this.state = {
            items: null,
            isExpanded: {},
            areAllExpanded: true,
            pageSize,
            limit: pageSize,
        };
    }

    componentDidMount() {
        this.dataLoader = new DataLoader({
            getInput: () => ({
                name: `${this.props.dataType}-list`,
                args: {
                    where: this.props.where,
                    limit: this.state.limit !== null ? this.state.limit + 1 : undefined,
                },
            }),
            onData: (items) => {
                if (this.state.limit && items.length > this.state.limit) {
                    this.setState({ items: items.slice(1), hasMoreItems: true });
                } else {
                    this.setState({ items, hasMoreItems: false, limit: null });
                }
            },
        });
    }

    componentDidUpdate(prevProps) {
        if (
            prevProps.dataType !== this.props.dataType
            || !deepEqual(prevProps.where, this.props.where)
        ) {
            this.updateLimit(this.state.pageSize);
        }
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

    onSortButtonClick(event) {
        const input = {
            dataType: this.props.dataType,
            where: this.props.where,
        };
        window.api.send(`${this.props.dataType}-sort`, input);
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
            ordering: orderedItems.map((item) => item.__id__),
        };
        window.api.send(`${this.props.dataType}-reorder`, input)
            .then(() => this.setState({ items: orderedItems }));
    }

    updateLimit(limit) {
        this.setState({ limit, items: null }, () => this.dataLoader.reload());
    }

    renderItems() {
        if (!this.state.items) {
            return (
                <BulletListLine>
                    <span>Loading ...</span>
                </BulletListLine>
            );
        }
        return this.state.items.map((item, index) => (
            <SortableBulletListItem
                index={index}
                key={item.__id__}
                dataType={this.props.dataType}
                valueKey={this.props.valueKey}
                ViewerComponent={this.props.ViewerComponent}
                viewerComponentProps={this.props.viewerComponentProps}
                EditorComponent={this.props.EditorComponent}
                allowReordering={this.props.allowReordering}
                prefixActions={this.props.prefixActions
                    .map((action) => ({ ...action, perform: action.perform.bind(null, item) }))}
                onMoveUp={(event) => this.onMove(index, -1, event)}
                onMoveDown={(event) => this.onMove(index, 1, event)}
                isExpanded={this.state.isExpanded[item.__id__] || false}
                setIsExpanded={(isExpanded) => this.setState((state) => {
                    state.isExpanded[item.__id__] = isExpanded;
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
            <BulletListLine>
                <AdderComponent where={this.props.where} />
            </BulletListLine>
        );
    }

    render() {
        return (
            <div className={classNames('bullet-list', this.props.className)}>
                <BulletListTitle
                    name={this.props.name}
                    areAllExpanded={this.state.areAllExpanded}
                    onToggleButtonClick={() => this.setState((state) => {
                        if (state.areAllExpanded) {
                            return { isExpanded: {} };
                        }
                        return {
                            isExpanded: Object.fromEntries(
                                state.items.map((item) => [item.__id__, true]),
                            ),
                        };
                    })}
                    onAddButtonClick={this.props.allowCreation
                        ? (event) => this.onAddButtonClick(event)
                        : null}
                    onSortButtonClick={this.props.allowSorting
                        ? (event) => this.onSortButtonClick(event)
                        : null}
                />
                <BulletListPager
                    batchSize={this.state.pageSize}
                    limit={this.state.limit}
                    updateLimit={(limit) => this.updateLimit(limit)}
                    itemsLength={this.state.items ? this.state.items.length : null}
                    hasMoreItems={this.state.hasMoreItems}
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
    allowSorting: PropTypes.bool,
    allowReordering: PropTypes.bool,
    ViewerComponent: PropTypes.func.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    viewerComponentProps: PropTypes.object,
    EditorComponent: PropTypes.func.isRequired,
    AdderComponent: PropTypes.func,
    // eslint-disable-next-line react/forbid-prop-types
    prefixActions: PropTypes.array,
    className: PropTypes.string,
    // eslint-disable-next-line react/forbid-prop-types
    settings: PropTypes.object.isRequired,
};

BulletList.defaultProps = {
    allowCreation: true,
    prefixActions: [],
};

const WrappedBulletList = SettingsContext.Wrapper(BulletList);
WrappedBulletList.Item = BulletListItem;

export default WrappedBulletList;
