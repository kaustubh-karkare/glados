import React from 'react';
import InputGroup from 'react-bootstrap/InputGroup';
import PropTypes from 'prop-types';
import { TextInput } from '../Common';

class LogStructureGroupEditor extends React.Component {
    constructor(props) {
        super(props);
        this.nameRef = React.createRef();
    }

    componentDidMount() {
        this.nameRef.current.focus();
    }

    updateLogStructureGroup(methodOrName, maybeValue) {
        const updatedLogStructureGroup = { ...this.props.logStructureGroup };
        if (typeof methodOrName === 'function') {
            methodOrName(updatedLogStructureGroup);
        } else {
            updatedLogStructureGroup[methodOrName] = maybeValue;
        }
        this.props.onChange(updatedLogStructureGroup);
    }

    renderName() {
        return (
            <InputGroup className="my-1">
                <InputGroup.Text>
                    Name
                </InputGroup.Text>
                <TextInput
                    value={this.props.logStructureGroup.name}
                    disabled={this.props.disabled}
                    onChange={(name) => this.updateLogStructureGroup('name', name)}
                    ref={this.nameRef}
                />
            </InputGroup>
        );
    }

    render() {
        return this.renderName();
    }
}

LogStructureGroupEditor.propTypes = {
    logStructureGroup: PropTypes.Custom.LogStructureGroup.isRequired,
    disabled: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired,
};

export default LogStructureGroupEditor;
