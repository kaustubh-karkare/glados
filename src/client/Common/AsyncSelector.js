import PropTypes from 'prop-types';
import React from 'react';
import Form from 'react-bootstrap/Form';

import DataLoader from './DataLoader';

class AsyncSelector extends React.Component {
    constructor(props) {
        super(props);
        this.state = { options: null };
    }

    componentDidMount() {
        this.dataLoader = new DataLoader({
            getInput: () => this.props.options,
            onData: (options) => this.setState({
                options: [...this.props.prefixOptions, ...options, ...this.props.suffixOptions],
            }),
        });
    }

    componentDidUpdate(prevProps) {
        this.dataLoader.reload();
    }

    componentWillUnmount() {
        this.dataLoader.stop();
    }

    onChange(id) {
        if (this.state.options) {
            const selectedOption = this.state.options.find(
                (option) => option.id.toString() === id,
            );
            if (selectedOption) {
                this.props.onChange(selectedOption);
            }
        }
    }

    render() {
        const options = this.state.options || [this.props.value];
        return (
            <Form.Control
                as="select"
                value={this.props.value.__id__}
                disabled={this.props.disabled}
                onChange={(event) => this.onChange(event.target.value)}
            >
                {options.map((item) => {
                    const optionProps = { key: item.__id__, value: item.__id__ };
                    return <option {...optionProps}>{item[this.props.labelKey]}</option>;
                })}
            </Form.Control>
        );
    }
}

AsyncSelector.propTypes = {
    labelKey: PropTypes.string,
    // eslint-disable-next-line react/forbid-prop-types
    value: PropTypes.object,
    // eslint-disable-next-line react/forbid-prop-types
    prefixOptions: PropTypes.array,
    // eslint-disable-next-line react/forbid-prop-types
    options: PropTypes.object,
    // eslint-disable-next-line react/forbid-prop-types
    suffixOptions: PropTypes.array,
    disabled: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired,
};

AsyncSelector.defaultProps = {
    labelKey: 'name',
    prefixOptions: [],
    suffixOptions: [],
};

export default AsyncSelector;
