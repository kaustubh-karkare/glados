import Form from 'react-bootstrap/Form';
import React from 'react';
import PropTypes from 'prop-types';

class AsyncSelect extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    componentDidMount() {
        this.reload();
    }

    onChange(id) {
        if (this.state.options) {
            const selectedOption = this.state.options.find((option) => option.id === id);
            if (selectedOption) {
                this.props.onChange(selectedOption);
            }
        }
    }

    reload() {
        window.api.send(`${this.props.dataType}-list`)
            .then((options) => this.setState({
                options: [...this.props.prefixOptions, ...options],
            }));
    }

    render() {
        const options = this.state.options || [this.props.value];
        return (
            <Form.Control
                as="select"
                value={this.props.value.id}
                onChange={(event) => this.onChange(parseInt(event.target.value, 10))}
            >
                {options.map((item) => {
                    const optionProps = { key: item.id, value: item.id };
                    return <option {...optionProps}>{item[this.props.labelKey]}</option>;
                })}
            </Form.Control>
        );
    }
}

AsyncSelect.propTypes = {
    dataType: PropTypes.string.isRequired,
    labelKey: PropTypes.string,
    // eslint-disable-next-line react/forbid-prop-types
    value: PropTypes.object,
    // eslint-disable-next-line react/forbid-prop-types
    prefixOptions: PropTypes.array,
    onChange: PropTypes.func.isRequired,
};

AsyncSelect.defaultProps = {
    labelKey: 'name',
};

export default AsyncSelect;
