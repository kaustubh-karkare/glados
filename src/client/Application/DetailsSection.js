import React from 'react';
import {
    Coordinator, LeftRight, TextEditor, debounce,
} from '../Common';

class DetailsSection extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            item: null,
            status: 'Unchanged!',
        };

        this.saveDebounced = debounce(this.saveNotDebounced, 500);

        Coordinator.register('details', this.select.bind(this));
    }

    select(partialItem) {
        partialItem.__type__ = partialItem.__type__ || 'log-topic';
        window.api.send(`${partialItem.__type__}-load`, partialItem)
            .then((item) => this.setState({ item }));
    }

    updateItem(name, value) {
        this.setState((state) => {
            state.item[name] = value;
            state.status = 'Pending ...';
            return state;
        }, this.saveDebounced);
    }

    saveNotDebounced() {
        this.setState({ status: 'Saving ...' });
        const { item } = this.state;
        window.api.send(`${item.__type__}-upsert`, item)
            .then((newItem) => this.setState({ status: 'Saved!', item: newItem }));
    }

    renderHeader() {
        const type = this.state.item.__type__;
        if (type === 'log-topic') {
            const logTopic = this.state.item;
            return (
                <LeftRight className="mx-1">
                    <div>{logTopic.name}</div>
                    <div>
                        <a
                            href="#"
                            onClick={() => Coordinator.invoke('topic-select', logTopic)}
                        >
                            Events
                        </a>
                        {' | '}
                        <a href="#" onClick={() => this.updateItem('onSidebar', !logTopic.onSidebar)}>
                            {logTopic.onSidebar ? 'Favorite' : 'Default'}
                        </a>
                    </div>
                </LeftRight>
            );
        } if (type === 'log-event') {
            const logEvent = this.state.item;
            return (
                <TextEditor
                    isSingleLine
                    unstyled
                    disabled
                    value={logEvent.title}
                />
            );
        }
        return null;
    }

    renderDetails() {
        return (
            <div className="details-section my-1">
                <TextEditor
                    unstyled
                    value={this.state.item.details}
                    onChange={(details) => this.updateItem('details', details)}
                    serverSideTypes={['log-topic']}
                />
                <div>
                    {this.state.status}
                </div>
            </div>
        );
    }

    render() {
        if (!this.state.item) {
            return null;
        }
        return (
            <div>
                {this.renderHeader()}
                {this.renderDetails()}
            </div>
        );
    }
}

export default DetailsSection;
