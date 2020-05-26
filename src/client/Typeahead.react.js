import React from 'react';
import PropTypes from 'prop-types';

class Typeahead extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            focus: false,
            options: null,
            index: null,
        };
    }
    render() {
        if (this.props.selected) {
            return (
                <span>
                    <input
                        type='text'
                        value={this.props.value}
                        readOnly={true}
                        disabled={true}
                    />
                    <input
                        type='button'
                        value='X'
                        onClick={() => this.props.onSelect(null)}
                    />
                </span>
            );
        } else {
            return (
                <span>
                    <input
                        type='text'
                        placeholder={this.props.placeholder}
                        value={this.props.value}
                        onFocus={() => this.setState({focus: true})}
                        onBlur={() => this.setState({focus: false})}
                        onChange={event => this.props.onChange(event.target.value)}
                        onKeyDown={event => this.onKeyDown(event.keyCode)}
                    />
                    {this.renderOptions()}
                </span>
            );
        }
    }
    componentDidUpdate(prevProps, prevState) {
        if (
            (prevProps.value != this.props.value) ||
            (prevState.focus != this.state.focus)
        ) {
            this.loadOptions();
        }
    }
    loadOptions() {
        if (this.state.focus && this.props.value) {
            this.props.source(this.props.value)
                .then(options => this.setState({options}));
        } else {
            this.setState({options: null, index: null});
        }
    }
    renderOptions() {
        if (!this.state.focus || this.state.options == null) {
            return null;
        }
        // TODO: Figure out the proper position here.
        // TODO: Make this match the input style.
        const containerStyle = {
            background: 'white',
            border: '1px solid black',
            position: 'absolute',
        };
        // TODO: Support mouse-over style.
        const highlightStyle = {
            background: '#aaa',
        };
        return (
            <div style={containerStyle}>
                {this.state.options.length == 0 ? "No suggestions!" : null}
                {this.state.options.map((option, index) =>
                    <div
                        key={option.label}
                        style={this.state.index == index ? highlightStyle : null}
                        onMouseDown={() => this.props.onSelect(option)}>
                        {option.label}
                    </div>
                )}
            </div>
        );
    }
    onKeyDown(keyCode) {
        if (this.state.options == null) {
            return;
        }
        const index = this.state.index;
        const total = this.state.options.length;
        if (keyCode == 38 && index > 0) { // up
            this.setState({index: index == null ? total - 1 : index - 1});
        } else if (keyCode == 40 && index < total - 1) { // down
            this.setState({index: index == null ? 0 : index + 1});
        } else if (keyCode == 13 && index != null) { // enter
            const option = this.state.options[index];
            // TODO: Add option to prevent collisions.
            this.props.onSelect(option);
        }
    }
}

const ValueType = PropTypes.shape({
    id: PropTypes.number.isRequired,
    label: PropTypes.string.isRequired,
});

Typeahead.propTypes = {
    value: PropTypes.string.isRequired,
    selected: PropTypes.bool.isRequired,
    source: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
    onSelect: PropTypes.func.isRequired,
};

export default Typeahead;
