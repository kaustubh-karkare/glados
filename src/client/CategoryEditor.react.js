import React from 'react';
import Dropdown from './Dropdown.react';
import PropTypes from './prop-types';
import LSDValueTypes from '../common/lsd_value_types';
import deepcopy from '../common/deepcopy';
import range from '../common/range';

class LSDKeyEditor extends React.Component {
    render() {
        // TODO: Make "Key Name" a Typeahead.
        return (
            <div>
                <Dropdown
                    options={
                        range(this.props.total).map(index => ({
                            label: (index + 1).toString(),
                            value: index,
                        }))
                    }
                    value={this.props.index}
                    onChange={event => this.props.onChange(this.props.lsdKey, event.target.value)}
                />
                <input
                    type='input'
                    value={this.props.lsdKey.name}
                    onChange={this.update.bind(this, 'name')}
                    placeholder='Key Name'
                />
                <Dropdown
                    options={Object.values(LSDValueTypes)}
                    value={this.props.lsdKey.value_type}
                    onChange={this.update.bind(this, 'value_type')}
                    disabled={this.props.lsdKey.id != -1}
                />
                <input
                    type='button'
                    value='Delete'
                    onClick={() => this.props.onChange(null)}
                />
            </div>
        );
    }
    update(name, event) {
        const lsdKey = {...this.props.lsdKey};
        lsdKey[name] = event.target.value;
        this.props.onChange(lsdKey, this.props.index);
    }
}

LSDKeyEditor.propTypes = {
    index: PropTypes.number.isRequired,
    total: PropTypes.number.isRequired,
    lsdKey: PropTypes.Custom.LSDKey.isRequired,
    onChange: PropTypes.func.isRequired,
};

class CategoryEditor extends React.Component {
    constructor(props) {
        super(props);
        this.state = {category: props.category};
    }
    render() {
        return (
            <div>
                <div>
                    <input
                        type='input'
                        placeholder='Category Name'
                        value={this.state.category.name}
                        onChange={event => {
                            const name = event.target.value;
                            this.setState(state => {
                                const category = {...state.category};
                                category.name = name;
                                return {category};
                            });
                        }}
                    />
                </div>
                {this.state.category.lsdKeys.map((lsdKey, index, list) =>
                    <LSDKeyEditor
                        key={index}
                        index={index}
                        total={list.length}
                        lsdKey={lsdKey}
                        onChange={this.updateLsdKey.bind(this, index)}
                    />
                )}
                <input
                    type='button'
                    value='Add Key'
                    onClick={() => this.updateLsdKey(this.state.category.lsdKeys.length)}
                />
                <input
                    type='button'
                    value='Reset'
                    onClick={() => this.setState({category: this.props.category})}
                />
                <input
                    type='button'
                    value='Save'
                />
            </div>
        );
    }
    updateLsdKey(originalIndex, lsdKey, newIndex) {
        this.setState(state => {
            const category = deepcopy(state.category);
            if (originalIndex == this.state.category.lsdKeys.length) {
                // create
                category.lsdKeys.push({
                    id: -1,
                    name: '',
                    value_type: LSDValueTypes.STRING.value,
                });
            } else if (lsdKey == null) {
                // delete
                category.lsdKeys.splice(originalIndex, 1);
            } else if (originalIndex != newIndex) {
                // reorder
                const removed = category.lsdKeys.splice(originalIndex, 1);
                category.lsdKeys.splice(newIndex, 0, removed[0]);
            } else {
                // update
                category.lsdKeys[originalIndex] = lsdKey;
            }
            return {category};
        });
    }
}

CategoryEditor.propTypes = {
    category: PropTypes.Custom.Category,
};

CategoryEditor.defaultProps = {
    category: {
        id: 1,
        name: 'Animal',
        lsdKeys: [
            {id: 2, name: 'Size', value_type: 'string'},
            {id: 3, name: 'Legs', value_type: 'integer'},
        ],
    },
};

export default CategoryEditor;
