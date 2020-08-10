import React from 'react';
import PropTypes from 'prop-types';
import Button from 'react-bootstrap/Button';
import InputGroup from 'react-bootstrap/InputGroup';
import {
    MdCheckCircle, MdClose, MdEdit, MdFavorite, MdFavoriteBorder, MdSearch,
} from 'react-icons/md';
import { RiLoaderLine } from 'react-icons/ri';
import {
    Coordinator, ScrollableSection, TextEditor, TypeaheadSelector, debounce,
} from '../Common';
import { LogEventDetailsHeader, LogEventEditor } from '../LogEvent';
import { LogStructureDetailsHeader, LogStructureEditor } from '../LogStructure';
import { LogTopicDetailsHeader, LogTopicEditor } from '../LogTopic';

import './DetailsSection.css';

const HEADER_MAPPING = {
    'log-event': {
        HeaderComponent: LogEventDetailsHeader,
        EditorComponent: LogEventEditor,
        valueKey: 'logEvent',
    },
    'log-structure': {
        HeaderComponent: LogStructureDetailsHeader,
        EditorComponent: LogStructureEditor,
        valueKey: 'logStructure',
    },
    'log-topic': {
        HeaderComponent: LogTopicDetailsHeader,
        EditorComponent: LogTopicEditor,
        valueKey: 'logTopic',
    },
};

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
            if (left.__type__ in HEADER_MAPPING) {
                window.api.send(`${left.__type__}-load`, left)
                    .then((item) => this.setState({ item }));
            } else {
                Coordinator.invoke('details', right);
                Coordinator.invoke(
                    'modal-error',
                    `${JSON.stringify(left, null, 4)}\n\nThis item does support details!`,
                );
            }
        }
    }

    onChange(item) {
        this.setState((state) => {
            state.item = item;
            state.isDirty = true;
            return state;
        }, this.saveDebounced);
    }

    onEditButtonClick() {
        const { item } = this.state;
        const { EditorComponent, valueKey } = HEADER_MAPPING[item.__type__];
        Coordinator.invoke('modal-editor', {
            dataType: item.__type__,
            EditorComponent,
            valueKey,
            value: item,
        });
    }

    saveNotDebounced() {
        const { item } = this.state;
        window.api.send(`${item.__type__}-upsert`, item)
            .then((newItem) => this.setState({ isDirty: item.details !== newItem.details }));
    }

    renderPrefixButtons(item) {
        const buttons = [];
        const { HeaderComponent } = HEADER_MAPPING[item.__type__];
        if (HeaderComponent.onSearchButtonClick) {
            buttons.push(
                <Button
                    key="search"
                    onClick={() => HeaderComponent.onSearchButtonClick(item)}
                    title="Search"
                >
                    <MdSearch />
                </Button>,
            );
        }
        if (typeof item.onSidebar === 'boolean') {
            buttons.push(
                <Button
                    key="favorite"
                    onClick={() => this.onChange({ ...item, onSidebar: !item.onSidebar })}
                    title="Favorite?"
                >
                    {item.onSidebar ? <MdFavorite /> : <MdFavoriteBorder />}
                </Button>,
            );
        }
        return buttons;
    }

    renderSuffixButtons(item) {
        return [
            <Button key="edit" title="Edit" onClick={() => this.onEditButtonClick()}>
                <MdEdit />
            </Button>,
            <Button key="status" title="Status">
                {this.state.isDirty ? <RiLoaderLine /> : <MdCheckCircle />}
            </Button>,
            <Button key="close" title="Close" onClick={() => Coordinator.invoke('details', null)}>
                <MdClose />
            </Button>,
        ];
    }

    renderHeader() {
        const { item } = this.state;
        if (item && item.__type__ in HEADER_MAPPING) {
            const { HeaderComponent, valueKey } = HEADER_MAPPING[item.__type__];
            const headerComponentProps = { [valueKey]: item };
            return (
                <InputGroup>
                    {this.renderPrefixButtons(item)}
                    <HeaderComponent {...headerComponentProps} />
                    {this.renderSuffixButtons(item)}
                </InputGroup>
            );
        }
        return (
            <InputGroup>
                <TypeaheadSelector
                    id="details-section-topic-or-structure"
                    serverSideTypes={['log-topic', 'log-structure']}
                    value={null}
                    disabled={this.props.disabled}
                    onChange={(newItem) => Coordinator.invoke('details', newItem)}
                    placeholder="Details ..."
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
