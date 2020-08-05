import React from 'react';
import InputGroup from 'react-bootstrap/InputGroup';
import PropTypes from '../prop-types';
import { TextInput } from '../Common';

class LogStructureGroupEditor extends React.Component {
    constructor(props) {
        super(props);
        this.nameRef = React.createRef();
    }

    componentDidMount() {
        this.nameRef.current.focus();
    }

    render() {
        const { logStructureGroup } = this.props;
        return (
            <>
                <InputGroup className="my-1">
                    <InputGroup.Text>
                        Name
                    </InputGroup.Text>
                    <TextInput
                        value={logStructureGroup.name}
                        disabled={this.props.disabled}
                        onChange={(name) => this.props.onChange({ ...logStructureGroup, name })}
                        ref={this.nameRef}
                    />
                </InputGroup>
            </>
        );
    }
}

LogStructureGroupEditor.propTypes = {
    logStructureGroup: PropTypes.Custom.LogStructureGroup.isRequired,
    disabled: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired,
};

export default LogStructureGroupEditor;
