import React from 'react';
import PropTypes from 'prop-types';
import Button from 'react-bootstrap/Button';
import InputGroup from 'react-bootstrap/InputGroup';
import { MdCheckCircle, MdClose } from 'react-icons/md';
import { RiLoaderLine } from 'react-icons/ri';
import {
    Coordinator, ScrollableSection, TextEditor, TypeaheadSelector, debounce,
} from '../Common';
import { LogTopicDetailsHeader } from '../LogTopic';

import './DetailsSection.css';

class DetailsSection extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            item: null,
            isDirty: false,
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
                .then((item) => this.setState({ item }));
        }
    }

    onChange(item) {
        this.setState((state) => {
            state.item = item;
            state.isDirty = true;
            return state;
        }, this.saveDebounced);
    }

    saveNotDebounced() {
        const { item } = this.state;
        window.api.send(`${item.__type__}-upsert`, item)
            .then((newItem) => this.setState({ isDirty: item.details !== newItem.details }));
    }

    renderHeaderButtons() {
        return (
            <>
                <Button title="Status">
                    {this.state.isDirty ? <RiLoaderLine /> : <MdCheckCircle />}
                </Button>
                <Button title="Close" onClick={() => Coordinator.invoke('details', null)}>
                    <MdClose />
                </Button>
            </>
        );
    }

    renderHeader() {
        const { item } = this.state;
        if (item && item.__type__ === 'log-event') {
            const logEvent = this.state.item;
            return (
                <InputGroup>
                    <div className="custom-text">
                        <TextEditor
                            isSingleLine
                            unstyled
                            disabled
                            value={logEvent.title}
                        />
                    </div>
                    {this.renderHeaderButtons()}
                </InputGroup>
            );
        }

        if (item && item.__type__ === 'log-topic') {
            return (
                <LogTopicDetailsHeader
                    logTopic={this.state.item}
                    disabled={this.props.disabled}
                    onChange={(logTopic) => this.onChange(logTopic)}
                >
                    {this.renderHeaderButtons()}
                </LogTopicDetailsHeader>
            );
        }
        return (
            <InputGroup>
                <TypeaheadSelector
                    dataType="log-topic"
                    value={null}
                    disabled={this.props.disabled}
                    onChange={(newItem) => Coordinator.invoke('details', newItem)}
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
                    onChange={(details) => this.onChange({ ...this.state.item, details })}
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
                <ScrollableSection padding={20 + 4}>
                    {this.renderDetails()}
                </ScrollableSection>
            </div>
        );
    }
}

DetailsSection.propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    item: PropTypes.any,
    disabled: PropTypes.bool.isRequired,
};

export default DetailsSection;
