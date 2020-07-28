import React from 'react';
import InputGroup from 'react-bootstrap/InputGroup';
import PropTypes from '../prop-types';
import { BulletList, TextInput } from '../Common';
import LogStructureList from './LogStructureList';


function LogStructureGroupViewer(props) {
    const { logStructureGroup } = props;
    return (
        <div>{logStructureGroup.name}</div>
    );
}

LogStructureGroupViewer.propTypes = {
    logStructureGroup: PropTypes.Custom.LogStructureGroup.isRequired,
};

LogStructureGroupViewer.Expanded = (props) => {
    const { logStructureGroup } = props;
    return (
        <LogStructureList
            where={{ group_id: logStructureGroup.id }}
            creator={{ logStructureGroup }}
            allowReordering
        />
    );
};

LogStructureGroupViewer.Expanded.propTypes = {
    logStructureGroup: PropTypes.Custom.LogStructureGroup.isRequired,
};

function LogStructureGroupEditor(props) {
    const { logStructureGroup } = props;
    return (
        <>
            <InputGroup className="my-1">
                <InputGroup.Text>
                    Name
                </InputGroup.Text>
                <TextInput
                    allowUpdate
                    dataType="log-topic"
                    value={logStructureGroup.name}
                    disabled={props.disabled}
                    onChange={(name) => props.onChange({ ...logStructureGroup, name })}
                />
            </InputGroup>
        </>
    );
}

LogStructureGroupEditor.propTypes = {
    logStructureGroup: PropTypes.Custom.LogStructureGroup.isRequired,
    disabled: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired,
};

function LogStructureGroupList() {
    return (
        <BulletList
            name="Structures"
            dataType="log-structure-group"
            valueKey="logStructureGroup"
            ViewerComponent={LogStructureGroupViewer}
            EditorComponent={LogStructureGroupEditor}
            allowReordering
        />
    );
}

export default LogStructureGroupList;
