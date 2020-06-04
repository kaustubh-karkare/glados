import {AsyncTypeahead} from 'react-bootstrap-typeahead';
import React from 'react';
import PropTypes from 'prop-types';

import 'react-bootstrap-typeahead/css/Typeahead.css';

class GenericTypeahead extends React.Component {
    constructor(props) {
        super(props);
        this.state = {isLoading: false, options: []};
    }
    render() {
        return (
            <AsyncTypeahead
                {...this.state}
                id={this.props.id}
                labelKey={this.props.labelKey}
                size="small"
                minLength={0}
                disabled={this.props.value.id > 0}
                onSearch={query => {
                    this.setState({isLoading: true}, () => {
                        window.api.send(this.props.rpcName, this.props.value)
                            .then(options => this.setState({isLoading: false, options}));
                    });
                }}
                filterBy={this.props.filterBy}
                placeholder={this.props.placeholder}
                selected={[this.props.value[this.props.labelKey]]}
                onInputChange={text => {
                    this.props.onUpdate({...this.props.value, [this.props.labelKey]: text});
                }}
                onChange={selected => {
                    if (selected.length) {
                        this.props.onUpdate(selected[0]);
                    }
                }}
                renderMenuItemChildren={(option, props, index) => {
                    return <div onMouseDown={() => this.props.onUpdate(option)}>{option[this.props.labelKey]}</div>;
                }}
            />
        )
    }
}

GenericTypeahead.propTypes = {
    filterBy: PropTypes.func,
    id: PropTypes.string.isRequired,
    labelKey: PropTypes.string.isRequired,
    onUpdate: PropTypes.func.isRequired,
    placeholder: PropTypes.string.isRequired,
    rpcName: PropTypes.string.isRequired,
    value: PropTypes.object.isRequired,
};

export default GenericTypeahead;
