import PropTypes from 'prop-types';
import React from 'react';
import Button from 'react-bootstrap/Button';
import InputGroup from 'react-bootstrap/InputGroup';
import Modal from 'react-bootstrap/Modal';

import LeftRight from './LeftRight';
import { debounce, KeyCodes, suppressUnlessShiftKey } from './Utils';

class EditorModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: props.value,
            status: 'Pending Validation ...',
            isSaving: false,
            isValidating: false,
        };
        this.validateItemDebounced = debounce(this.validateItemNotDebounced, 500);
    }

    componentDidMount() {
        this.validateItemDebounced();
    }

    onChange(value) {
        this.setState({ value }, () => this.validateItemDebounced());
    }

    onSave() {
        this.saveItemNotDebounced();
    }

    onClose() {
        this.props.onClose(this.state.value);
    }

    validateItemNotDebounced() {
        this.setState({ isValidating: true, status: 'Validating ...' });
        window.api.send(`${this.props.dataType}-validate`, this.state.value)
            .finally(() => this.setState({ isValidating: false }))
            .then((validationErrors) => this.setState({
                status: validationErrors.join('\n') || 'No validation errors!',
            }))
            .catch(() => this.setState({ status: 'Error!' }));
    }

    saveItemNotDebounced() {
        this.setState({ isSaving: true, status: 'Saving ...' });
        let promise;
        if (this.props.onSave) {
            // A custom onSave method is used for because reminder completion needs to
            // create the event and update the structure as part of same single transaction.
            promise = this.props.onSave(this.state.value);
            if (!(promise instanceof Promise)) {
                // If the custom onSave method does not return a promise,
                // it is assumed that the component will be unmounted.
                return;
            }
        } else {
            promise = window.api.send(`${this.props.dataType}-upsert`, this.state.value);
        }
        promise
            .finally(() => this.setState({ isSaving: false }))
            .then((value) => {
                this.setState({ status: 'Saved!', value });
                this.onClose();
            })
            .catch(() => this.setState({ status: 'Error!' }));
    }

    renderSaveButton() {
        return (
            <Button
                disabled={this.state.isSaving || this.state.isValidating}
                onClick={() => this.onSave()}
                style={{ width: '50px' }}
            >
                Save
            </Button>
        );
    }

    render() {
        if (!this.props.value) {
            return null;
        }
        const { EditorComponent, editorProps } = this.props;
        editorProps[this.props.valueKey] = this.state.value;
        editorProps.disabled = this.state.isSaving;
        return (
            <Modal
                show
                onHide={() => this.onClose()}
                onEscapeKeyDown={suppressUnlessShiftKey}
            >
                <Modal.Header closeButton>
                    <Modal.Title>Editor</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <EditorComponent
                        {...editorProps}
                        onChange={(newValue) => this.onChange(newValue)}
                        onSpecialKeys={(event) => {
                            if (!event.shiftKey) return;
                            if (event.keyCode === KeyCodes.ENTER) {
                                this.onSave();
                            } else if (event.keyCode === KeyCodes.ESCAPE) {
                                this.onClose();
                            }
                        }}
                    />
                </Modal.Body>
                <Modal.Body>
                    <LeftRight>
                        <div style={{ whiteSpace: 'pre-wrap' }}>
                            {this.state.status}
                        </div>
                        <InputGroup>
                            {this.renderSaveButton()}
                        </InputGroup>
                    </LeftRight>
                </Modal.Body>
            </Modal>
        );
    }
}

EditorModal.propTypes = {
    dataType: PropTypes.string.isRequired,
    EditorComponent: PropTypes.func.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    valueKey: PropTypes.string.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    value: PropTypes.object.isRequired,
    onClose: PropTypes.func.isRequired, // provided by ModalStack

    // eslint-disable-next-line react/forbid-prop-types
    editorProps: PropTypes.object,
    onSave: PropTypes.func,
};

EditorModal.defaultProps = {
    editorProps: {},
};

export default EditorModal;
