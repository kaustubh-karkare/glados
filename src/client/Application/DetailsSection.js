import React from 'react';
import PropTypes from 'prop-types';
import Button from 'react-bootstrap/Button';
import InputGroup from 'react-bootstrap/InputGroup';
import { MdFavorite, MdFavoriteBorder, MdSearch } from 'react-icons/md';
import {
    Coordinator, ScrollableSection, TextEditor, TypeaheadSelector, debounce,
} from '../Common';

import './DetailsSection.css';

class DetailsSection extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            item: null,
            status: 'Unchanged!',
        };
        this.saveDebounced = debounce(this.saveNotDebounced, 500);
    }

    componentDidMount() {
        this.componentDidUpdate();
    }

    componentDidUpdate(prevProps) {
        const left = this.props.item;
        const right = this.state.item;
        if (!left && right) {
            // eslint-disable-next-line react/no-did-update-set-state
            this.setState({ item: null });
        }
        if (left && (!right || left.__type__ !== right.__type__ || left.id !== right.id)) {
            window.api.send(`${left.__type__}-load`, left)
                .then((item) => this.setState({ item }, this.afterUpdate));
        }
    }

    onChange(item) {
        Coordinator.invoke('details', item);
        this.setState({ item }, this.afterUpdate);
    }

    onUpdate(name, value) {
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
        const { item } = this.state;
        if (item && item.__type__ === 'log-event') {
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
        if (item && item.__type__ === 'log-topic') {
            const logTopic = this.state.item;
            return (
                <InputGroup>
                    <Button
                        onClick={() => this.onUpdate('onSidebar', !logTopic.onSidebar)}
                        title="Favorite?"
                    >
                        {logTopic.onSidebar ? <MdFavorite /> : <MdFavoriteBorder />}
                    </Button>
                    <TypeaheadSelector
                        dataType="log-topic"
                        value={logTopic}
                        disabled={this.props.disabled}
                        onChange={(newItem) => this.onChange(newItem)}
                    />
                    <Button
                        onClick={() => Coordinator.invoke('topic-select', logTopic)}
                        title="Search"
                    >
                        <MdSearch />
                    </Button>
                </InputGroup>
            );
        }
        return (
            <InputGroup>
                <TypeaheadSelector
                    dataType="log-topic"
                    value={null}
                    disabled={this.props.disabled}
                    onChange={(newItem) => this.onChange(newItem)}
                    placeholder="Topic Details ..."
                />
            </InputGroup>
        );
    }

    renderDetails() {
        if (!this.state.item) {
            return null;
        }
        return (
            <div>
                <TextEditor
                    unstyled
                    value={this.state.item.details}
                    onChange={(details) => this.onUpdate('details', details)}
                    serverSideTypes={['log-topic']}
                />
            </div>
        );
    }

    render() {
        return (
            <div className="details-section">
                <div className="mb-1">
                    {this.renderHeader()}
                </div>
                <ScrollableSection padding={20 + 4 + 4 + 15}>
                    {this.renderDetails()}
                </ScrollableSection>
                <div className="footer mt-1">
                    {this.state.item ? this.state.status : null}
                </div>
            </div>
        );
    }
}

DetailsSection.propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    item: PropTypes.any,
    disabled: PropTypes.bool,
};

DetailsSection.defaultProps = {
    disabled: false,
};

export default DetailsSection;
