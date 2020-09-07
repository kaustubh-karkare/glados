import InputGroup from 'react-bootstrap/InputGroup';
import React from 'react';
import PropTypes from 'prop-types';
import { TextInput } from '../Common';

class LogModeEditor extends React.Component {
    constructor(props) {
        super(props);
        this.nameRef = React.createRef();
    }

    componentDidMount() {
        this.nameRef.current.focus();
    }

    updateLogMode(name, value) {
        const updatedLogMode = { ...this.props.logMode };
        updatedLogMode[name] = value;
        this.props.onChange(updatedLogMode);
    }

    render() {
        const { logMode } = this.props;
        return (
            <InputGroup className="my-1">
                <InputGroup.Text>
                    Name
                </InputGroup.Text>
                <TextInput
                    allowUpdate
                    dataType="log-mode"
                    value={logMode.name}
                    disabled={this.props.disabled}
                    onChange={(name) => this.updateLogMode('name', name)}
                    ref={this.nameRef}
                />
            </InputGroup>
        );
    }
}

LogModeEditor.propTypes = {
    logMode: PropTypes.Custom.LogMode.isRequired,
    disabled: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired,
};

export default LogModeEditor;
