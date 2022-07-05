import PropTypes from 'prop-types';
import React from 'react';
import Button from 'react-bootstrap/Button';
import InputGroup from 'react-bootstrap/InputGroup';
import { MdAddCircleOutline } from 'react-icons/md';

import { LogKey } from '../../common/data_types';
import { SortableList, TextEditor, TypeaheadOptions } from '../Common';
import LogKeyEditor from './LogKeyEditor';

class LogKeyListEditor extends React.Component {
    renderTitleTemplateEditor() {
        return (
            <InputGroup className="my-1">
                <InputGroup.Text style={{ height: 'inherit', width: 127 }}>
                    {this.props.templateLabel}
                </InputGroup.Text>
                <TextEditor
                    isSingleLine
                    value={this.props.templateValue}
                    options={this.props.templateOptions}
                    disabled={this.props.disabled}
                    onChange={(newTemplate) => this.props.onTemplateChange(newTemplate)}
                />
                <Button
                    className="log-structure-add-key"
                    disabled={this.props.disabled}
                    onClick={() => this.props.onLogKeysChange([
                        ...this.props.logKeys,
                        LogKey.createVirtual(),
                    ])}
                    style={{ height: 'inherit' }}
                >
                    <MdAddCircleOutline />
                </Button>
            </InputGroup>
        );
    }

    renderSortableList() {
        return (
            <SortableList
                items={this.props.logKeys}
                disabled={this.props.disabled}
                onChange={(updatedLogKeys) => this.props.onLogKeysChange(updatedLogKeys)}
                onSearch={this.props.onValueSearch}
                type={LogKeyEditor}
                itemsKey="logKeys"
            />
        );
    }

    render() {
        return (
            <>
                {this.renderTitleTemplateEditor()}
                {this.renderSortableList()}
            </>
        );
    }
}

LogKeyListEditor.propTypes = {
    templateLabel: PropTypes.string.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    templateValue: PropTypes.any,
    templateOptions: PropTypes.instanceOf(TypeaheadOptions),
    onTemplateChange: PropTypes.func.isRequired,
    logKeys: PropTypes.arrayOf(PropTypes.Custom.LogKey.isRequired).isRequired,
    onLogKeysChange: PropTypes.func.isRequired,
    onValueSearch: PropTypes.func.isRequired,
    disabled: PropTypes.bool.isRequired,
};

export default LogKeyListEditor;
