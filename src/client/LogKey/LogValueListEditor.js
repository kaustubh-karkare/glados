import PropTypes from 'prop-types';
import React from 'react';
import InputGroup from 'react-bootstrap/InputGroup';

import LogValueEditor from './LogValueEditor';

class LogValueListEditor extends React.Component {
    constructor(props) {
        super(props);
        this.firstRef = React.createRef();
    }

    focus() {
        this.firstRef.current.focus();
    }

    render() {
        return this.props.logKeys.map((logKey, index) => (
            <InputGroup className="my-1" key={logKey.__id__}>
                <InputGroup.Text>
                    {logKey.name}
                </InputGroup.Text>
                <LogValueEditor
                    logKey={logKey}
                    disabled={this.props.disabled}
                    onChange={(updatedLogKey) => {
                        const updatedLogKeys = [...this.props.logKeys];
                        updatedLogKeys[index] = updatedLogKey;
                        this.props.onChange(updatedLogKeys);
                    }}
                    onSearch={(query) => window.api.send('value-typeahead', {
                        source: this.props.source,
                        query,
                        index,
                    })}
                    ref={index === 0 ? this.firstRef : null}
                />
            </InputGroup>
        ));
    }
}

LogValueListEditor.propTypes = {
    source: PropTypes.Custom.Item.isRequired,
    logKeys: PropTypes.arrayOf(PropTypes.Custom.LogKey.isRequired).isRequired,
    disabled: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired,
};

export default LogValueListEditor;
