import React from 'react';
import Dropdown from './Dropdown.react';
import Typeahead from './Typeahead.react';
import PropTypes from './prop-types';
import LSDValueTypes from '../common/lsd_value_types';
import assert from '../common/assert';
import deepcopy from '../common/deepcopy';
import range from '../common/range';

class LSDKeyEditor extends React.Component {
    render() {
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
                    onChange={event => this.props.onChange('reorder', event.target.value)}
                />
                <Typeahead
                    type='input'
                    width={130}
                    value={this.props.lsdKey.name}
                    selected={this.props.lsdKey.id != -1}
                    source={(query) => {
                        return Promise.resolve(
                            ["ant","bat","bell","cat","dog","eel","fly"]
                                .map((label, index) => {
                                    return {id: index, name: label, valueType: 'string', label};
                                }).filter(item => item.label.startsWith(query))
                        );
                    }}
                    onChange={value => this.update('name', value)}
                    onSelect={item => {
                        if (item) {
                            assert(item.id && item.name && item.valueType);
                            this.props.onChange('update', item);
                        } else {
                            this.props.onChange('reset');
                        }
                    }}
                    placeholder='Key Name'
                />
                <Dropdown
                    options={Object.values(LSDValueTypes)}
                    value={this.props.lsdKey.valueType}
                    onChange={event => this.update('valueType', event.target.value)}
                    disabled={this.props.lsdKey.id != -1}
                />
                <input
                    type='button'
                    value='Delete'
                    onClick={() => this.props.onChange('delete')}
                />
            </div>
        );
    }
    update(name, value) {
        const lsdKey = {...this.props.lsdKey};
        lsdKey[name] = value;
        this.props.onChange('update', lsdKey);
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
                    onClick={() => this.updateLsdKey(null, 'create')}
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
    updateLsdKey(originalIndex, operation, data) {
        this.setState(state => {
            const defaultLsdKey = {
                id: -1,
                name: '',
                valueType: LSDValueTypes.STRING.value,
            };
            const category = deepcopy(state.category);
            if (operation == 'create') {
                category.lsdKeys.push(defaultLsdKey);
            } else if (operation == 'delete') {
                category.lsdKeys.splice(originalIndex, 1);
            } else if (operation == 'reset') {
                category.lsdKeys[originalIndex] = defaultLsdKey;
            } else if (operation == 'reorder') {
                const newIndex = data;
                const removed = category.lsdKeys.splice(originalIndex, 1);
                category.lsdKeys.splice(newIndex, 0, removed[0]);
            } else if (operation == 'update') {
                category.lsdKeys[originalIndex] = data;
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
            {id: 2, name: 'Size', valueType: 'string'},
            {id: 3, name: 'Legs aksjhdkashdklakhjsda', valueType: 'integer'},
            {id: -1, name: '', valueType: 'integer'},
        ],
    },
};

export default CategoryEditor;
