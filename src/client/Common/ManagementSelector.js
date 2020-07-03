import InputGroup from 'react-bootstrap/InputGroup';
import React from 'react';
import PropTypes from 'prop-types';
import Selector from './Selector';
import Typeahead from './Typeahead';
import Enum from '../../common/Enum';

const [Options, Type] = Enum([
    {
        value: 'none',
        label: 'None',
        // show only if unavailable on original entity
        // no extra details
    },
    {
        value: 'associate',
        label: 'Associate',
        // show only if unavailable on original entity
        // show typeahead to select item of that type
    },
    {
        value: 'add',
        label: 'Add',
        // show only if unavailable on original entity
        // create virtual item of type + editor
    },
    {
        value: 'edit',
        label: 'Edit',
        // show only if available on original entity
        // use existing real item +  show editor
    },
    {
        value: 'disassociate',
        label: 'Disassociate',
        // show only if available on original entity
        // no extra details
    },
    {
        value: 'delete',
        label: 'Delete',
        // show only if available on original entity
        // no extra details
    },
]);

class ManagementSelector extends React.Component {
    constructor(props) {
        super(props);
        const isExistingValue = !!props.value;
        this.state = {
            isExistingValue,
            type: isExistingValue ? Type.EDIT : Type.NONE,
        };
    }

    onChange(type) {
        this.setState({ type });
        if (type === Type.NONE) {
            this.props.onChange(null);
        } else if (type === Type.ADD) {
            const value = this.props.create();
            this.props.onChange({ ...value, isIndirectlyManaged: true });
        } else if (type === Type.ASSOCIATE) {
            this.props.onChange(null);
        } else if (type === Type.EDIT) {
            // do nothing
        } else if (type === Type.DISASSOCIATE) {
            const { value } = this.props;
            this.props.onChange({ ...value, isIndirectlyManaged: false });
        } else if (type === Type.DELETE) {
            this.props.onChange(null);
        }
    }

    renderTypeaheadOrEditor() {
        if (this.state.type === Type.ASSOCIATE) {
            return (
                <InputGroup className="my-1">
                    <InputGroup.Text>
                        Select
                    </InputGroup.Text>
                    <Typeahead
                        dataType={this.props.dataType}
                        value={this.props.value}
                        onUpdate={(newValue) => {
                            if (newValue) {
                                newValue = { ...newValue, isIndirectlyManaged: true };
                            }
                            this.props.onChange(newValue);
                        }}
                        allowDelete
                    />
                </InputGroup>
            );
        } if (this.state.type === Type.ADD || this.state.type === Type.EDIT) {
            const {
                EditorComponent, valueKey, value, onChange,
            } = this.props;
            const editorProps = { [valueKey]: value, onChange };
            return <EditorComponent {...editorProps} />;
        }
        return null;
    }

    render() {
        const { isExistingValue } = this.state;
        return (
            <>
                <InputGroup className="my-1">
                    <InputGroup.Text>
                        {this.props.label}
                    </InputGroup.Text>
                    <Selector
                        value={this.state.type}
                        options={isExistingValue ? Options.slice(3) : Options.slice(0, 3)}
                        onChange={(type) => this.onChange(type)}
                    />
                </InputGroup>
                {this.renderTypeaheadOrEditor()}
            </>
        );
    }
}

ManagementSelector.propTypes = {
    label: PropTypes.string.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    value: PropTypes.object,
    create: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,

    dataType: PropTypes.string.isRequired,
    EditorComponent: PropTypes.func.isRequired,
    valueKey: PropTypes.string.isRequired,
};

export default ManagementSelector;