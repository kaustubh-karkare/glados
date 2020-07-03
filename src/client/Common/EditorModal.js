import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import PropTypes from 'prop-types';
import React from 'react';
import assert from '../../common/assert';
import LeftRight from './LeftRight';
import { KeyCodes, debounce } from './Utils';


function suppressUnlessShiftKey(event) {
    if (!event.shiftKey) {
        event.preventDefault();
    }
}


class EditorModal extends React.Component {
    constructor(props) {
        super(props);
        assert(!(props.allowAutoSave && (props.onSave || props.closeOnSave)));
        this.state = {
            autoSave: false,
            value: props.value,
            status: 'Pending Validation ...',
            isSaving: false,
            isValidating: false,
        };
        this.saveItemDebounced = debounce(this.saveItemNotDebounced, 500);
        this.validateItemDebounced = debounce(this.validateItemNotDebounced, 500);
    }

    componentDidMount() {
        this.validateItemDebounced();
    }

    onChange(value) {
        this.setState({ value }, () => {
            if (this.state.autoSave) {
                this.saveItemDebounced();
            } else {
                this.validateItemDebounced();
            }
        });
    }

    onSave() {
        this.saveItemNotDebounced();
    }

    onClose() {
        this.props.onClose(this.state.item);
    }

    validateItemNotDebounced() {
        this.setState({ isValidating: true, status: 'Validating ...' });
        window.api.send(`${this.props.dataType}-validate`, this.state.value)
            .finally(() => this.setState({ isValidating: false }))
            .then((validationErrors) => this.setState({
                status: validationErrors.join('\n') || 'No validation errors!',
            }))
            .catch((error) => window.modalStack_displayError(error));
    }

    saveItemNotDebounced() {
        this.setState({ isSaving: true, status: 'Saving ...' });
        let promise;
        if (this.props.onSave) {
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
                if (this.props.closeOnSave) this.props.onClose();
            })
            .catch((error) => window.modalStack_displayError(error));
    }

    renderAutoSaveToggle() {
        return (
            <Form.Check
                id="auto-save"
                type="switch"
                label="Auto-save"
                checked={this.state.autoSave}
                onChange={(event) => {
                    this.setState({ autoSave: event.target.checked });
                }}
                style={{ display: 'inline-block', marginRight: '20px' }}
            />
        );
    }

    renderSaveButton() {
        return (
            <Button
                disabled={this.state.isSaving || this.state.isValidating}
                onClick={() => (this.state.autoSave ? this.onClose() : this.onSave())}
                size="sm"
                variant="secondary"
                style={{ width: '50px' }}
            >
                {this.state.autoSave ? 'Close' : 'Save'}
            </Button>
        );
    }

    render() {
        if (!this.props.value) {
            return null;
        }
        const { EditorComponent, editorProps } = this.props;
        editorProps[this.props.valueKey] = this.state.value;
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
                                this.props.onSave();
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
                        <div>
                            {this.props.allowAutoSave ? this.renderAutoSaveToggle() : null}
                            {this.renderSaveButton()}
                        </div>
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
    allowAutoSave: PropTypes.bool,
    onSave: PropTypes.func,
    closeOnSave: PropTypes.bool,
};

EditorModal.defaultProps = {
    editorProps: {},
    allowAutoSave: false,
    closeOnSave: false,
};


export default EditorModal;
