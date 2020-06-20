import Button from 'react-bootstrap/Button';
import { FaRegTrashAlt } from 'react-icons/fa';
import InputGroup from 'react-bootstrap/InputGroup';
import React from 'react';
import { LogKeyNameTypeahead } from '../LogKey';
import LogValueDataTypeahead from './LogValueDataTypeahead';
import PropTypes from '../prop-types';
import { Dropdown, SortableDragHandle } from '../Common';

import { createEmptyLogKey, createEmptyLogValue } from '../Data';
import { getLogKeyTypes } from '../../common/LogKey';

class LogValueEditor extends React.Component {
    updateLogKey(logKey) {
        const logValue = { ...this.props.logValue };
        logValue.logKey = logKey;
        this.props.onUpdate(logValue);
    }

    renderDeleteButton() {
        if (this.props.isNewCategory) {
            return (
                <InputGroup.Append>
                    <Button
                        onClick={this.props.onDelete}
                        size="sm"
                        variant="secondary"
                    >
                        <FaRegTrashAlt />
                    </Button>
                </InputGroup.Append>
            );
        }
        return null;
    }

    render() {
        const { logKey } = this.props.logValue;
        return (
            <InputGroup className="mb-1" size="sm">
                <InputGroup.Prepend>
                    <SortableDragHandle />
                </InputGroup.Prepend>
                <Dropdown
                    disabled={logKey.id < 0}
                    value={logKey.type}
                    options={getLogKeyTypes()}
                    onUpdate={(type) => this.updateLogKey({ ...logKey, type })}
                />
                <LogKeyNameTypeahead
                    logKey={this.props.logValue.logKey}
                    allowDelete={this.props.isNewCategory}
                    onUpdate={(updatedLogKey) => this.updateLogKey(updatedLogKey)}
                    onDelete={() => this.updateLogKey(createEmptyLogKey())}
                />
                <LogValueDataTypeahead
                    allowUpdate
                    allowDelete={this.props.logValue.id > 0}
                    logValue={this.props.logValue}
                    onUpdate={this.props.onUpdate}
                    onDelete={(logValue) => this.props.onUpdate(
                        createEmptyLogValue(logValue.logKey),
                    )}
                />
                {this.renderDeleteButton()}
            </InputGroup>
        );
    }
}

LogValueEditor.propTypes = {
    isNewCategory: PropTypes.bool.isRequired,
    logValue: PropTypes.Custom.LogValue.isRequired,
    onUpdate: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
};

export default LogValueEditor;
