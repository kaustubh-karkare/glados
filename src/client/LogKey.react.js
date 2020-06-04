import Button from 'react-bootstrap/Button';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Dropdown from 'react-bootstrap/Dropdown';
import DropdownButton from 'react-bootstrap/DropdownButton';
import { FaRegTrashAlt } from 'react-icons/fa';
import GenericTypeahead from './GenericTypeahead.react';
import InputGroup from 'react-bootstrap/InputGroup';
import LogKeyTypes from '../common/log_key_types';
import React from 'react';
import PropTypes from './prop-types';
import {SortableDragHandle, SortableElement, SortableList} from './Sortable.react';

import arrayMove from 'array-move';

class LogKeyTypeDropdown extends React.Component {
    render() {
        return (
            <>
                <DropdownButton
                    as={ButtonGroup}
                    className=""
                    disabled={this.props.logKey.id > 0}
                    onSelect={() => null}
                    size="sm"
                    title={this.props.logKey.type}
                    variant="secondary">
                    {Object.values(LogKeyTypes).map(item =>
                        <Dropdown.Item
                            key={item.value}
                            onMouseDown={() => {
                                const logKey = {...this.props.logKey};
                                logKey.type = item.value;
                                this.props.onUpdate(logKey);
                            }}>
                            {item.label}
                        </Dropdown.Item>
                    )}
                </DropdownButton>
            </>
        );
    }
}

LogKeyTypeDropdown.propTypes = {
    logKey: PropTypes.Custom.LogKey.isRequired,
    onUpdate: PropTypes.func.isRequired,
};

class LogKeyNameTypeahead extends React.Component {
    render() {
        return (
            <GenericTypeahead
                {...this.props}
                id="log_key"
                labelKey="name"
                placeholder="Key Name"
                rpcName="log-key-list"
                value={this.props.logKey}
            />
        )
    }
}

LogKeyNameTypeahead.propTypes = {
    logKey: PropTypes.Custom.LogKey.isRequired,
};

class LogKeyEditor extends React.Component {
    render() {
        return (
            <InputGroup className="mb-1" size="sm">
                <InputGroup.Prepend>
                    <SortableDragHandle>
                        <InputGroup.Text style={{cursor: 'grab'}}>
                            {'⋮'}
                        </InputGroup.Text>
                    </SortableDragHandle>
                    <LogKeyTypeDropdown
                        logKey={this.props.logKey}
                        onUpdate={this.props.onUpdate}
                    />
                </InputGroup.Prepend>
                <LogKeyNameTypeahead
                    allowEditing={this.props.allowEditing}
                    logKey={this.props.logKey}
                    filterBy={this.props.filterBy}
                    onUpdate={this.props.onUpdate}
                />
                <InputGroup.Append>
                    <Button
                        onClick={this.props.onDelete}
                        size="sm"
                        variant="secondary">
                        <FaRegTrashAlt />
                    </Button>
                </InputGroup.Append>
            </InputGroup>
        );
    }
    onUpdate(name, value) {
        const logKey = {...this.props.logKey};
        logKey[name] = value;
        this.props.onUpdate(logKey);
    }
}

LogKeyEditor.propTypes = {
    allowEditing: PropTypes.bool,
    logKey: PropTypes.Custom.LogKey.isRequired,
    filterBy: PropTypes.func,
    onUpdate: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
};

const LogKeyEditorSortableItem = SortableElement(LogKeyEditor);

class LogKeyListEditor extends React.Component {
    render() {
        return (
            <SortableList
                useDragHandle={true}
                onSortEnd={this.onReorder.bind(this)}>
                {this.props.logKeys.map((logKey, index) =>
                    <LogKeyEditorSortableItem
                        key={logKey.id}
                        index={index}
                        logKey={logKey}
                        allowEditing={true}
                        filterBy={this.filterBy.bind(this, index)}
                        onUpdate={this.onUpdate.bind(this, index)}
                        onDelete={this.onDelete.bind(this, index)}
                    />
                )}
            </SortableList>
        );
    }
    onReorder({oldIndex, newIndex}) {
        this.props.onUpdate(arrayMove(this.props.logKeys, oldIndex, newIndex));
    }
    filterBy(index, option) {
        const logKey = this.props.logKeys[index];
        return (
            this.props.logKeys
                .filter((_, itemIndex) => (index != itemIndex))
                .every(logKey => option.id != logKey.id) &&
            option.name.includes(logKey.name)
        );
    }
    onUpdate(index, logKey) {
        const logKeys = [...this.props.logKeys];
        logKeys[index] = logKey;
        this.props.onUpdate(logKeys);
    }
    onDelete(index, logKey) {
        const logKeys = [...this.props.logKeys];
        logKeys.splice(index, 1);
        this.props.onUpdate(logKeys);
    }
}

LogKeyListEditor.propTypes = {
    logKeys: PropTypes.arrayOf(PropTypes.Custom.LogKey.isRequired).isRequired,
    onUpdate: PropTypes.func.isRequired,
}

export {LogKeyTypeDropdown, LogKeyNameTypeahead, LogKeyEditor, LogKeyListEditor};
