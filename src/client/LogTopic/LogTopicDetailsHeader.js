import { RiLoaderLine } from 'react-icons/ri';
import React from 'react';
import Button from 'react-bootstrap/Button';
import InputGroup from 'react-bootstrap/InputGroup';
import {
    MdCheckCircle, MdClose, MdFavorite, MdFavoriteBorder, MdSearch,
} from 'react-icons/md';
import PropTypes from '../prop-types';
import { Coordinator, Dropdown } from '../Common';
import LogTopicEditor from './LogTopicEditor';
import { LogTopic, isRealItem } from '../../data';

const ADD_CHILD_OPTION = {
    id: -1,
    name: 'Add Child ...',
};

class LogTopicDetailsHeader extends React.Component {
    // eslint-disable-next-line class-methods-use-this
    renderTopicName(logTopic) {
        return (
            <a
                href="#"
                className="topic"
                onClick={() => Coordinator.invoke('details', logTopic)}
            >
                {logTopic.name}
            </a>
        );
    }

    renderChildTopics(logTopic) {
        return (
            <Dropdown
                disabled={this.props.disabled}
                options={{
                    name: 'log-topic-list',
                    args: {
                        selector: { parent_topic_id: logTopic.id },
                        ordering: true,
                    },
                }}
                suffixOptions={[ADD_CHILD_OPTION]}
                onChange={(childLogTopic) => {
                    if (childLogTopic.id === ADD_CHILD_OPTION.id) {
                        Coordinator.invoke('modal-editor', {
                            dataType: 'log-topic',
                            EditorComponent: LogTopicEditor,
                            valueKey: 'logTopic',
                            value: LogTopic.createVirtual({ parentLogTopic: logTopic }),
                            onClose: (newLogTopic) => {
                                if (isRealItem(newLogTopic)) {
                                    Coordinator.invoke('details', newLogTopic);
                                }
                            },
                        });
                    } else {
                        Coordinator.invoke('details', childLogTopic);
                    }
                }}
            >
                <a href="#" className="topic">...</a>
            </Dropdown>
        );
    }

    render() {
        const { logTopic } = this.props;
        return (
            <InputGroup>
                <Button
                    onClick={() => Coordinator.invoke('topic-select', logTopic)}
                    title="Search"
                >
                    <MdSearch />
                </Button>
                <Button
                    onClick={() => this.props.onChange({
                        ...logTopic,
                        onSidebar: !logTopic.onSidebar,
                    })}
                    title="Favorite?"
                >
                    {logTopic.onSidebar ? <MdFavorite /> : <MdFavoriteBorder />}
                </Button>
                <div className="custom-text">
                    {logTopic.parentLogTopic
                        ? (
                            <>
                                {this.renderTopicName(logTopic.parentLogTopic)}
                                {' '}
                                {' / '}
                            </>
                        )
                        : null}
                    {logTopic.name}
                    {' / '}
                    {this.renderChildTopics(logTopic)}
                </div>
                <Button title="Status">
                    {this.props.isDirty ? <RiLoaderLine /> : <MdCheckCircle />}
                </Button>
                <Button title="Close" onClick={() => Coordinator.invoke('details', null)}>
                    <MdClose />
                </Button>
            </InputGroup>
        );
    }
}

LogTopicDetailsHeader.propTypes = {
    logTopic: PropTypes.Custom.LogTopic.isRequired,
    isDirty: PropTypes.bool.isRequired,
    disabled: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired,
};

export default LogTopicDetailsHeader;
