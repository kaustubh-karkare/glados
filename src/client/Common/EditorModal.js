import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Modal from 'react-bootstrap/Modal';
import PropTypes from 'prop-types';
import React from 'react';
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
        this.state = {
            autoSave: false,
        };
        this.validateItemDebounced = debounce(this.validateItemNotDebounced, 500);
    }

    componentDidUpdate(prevProps) {
        if (prevProps.value !== this.props.value) {
            if (!this.props.value) {
                // eslint-disable-next-line react/no-did-update-set-state
                this.setState({
                    validationStatus: null,
                    validationErrors: null,
                });
            } else {
                // eslint-disable-next-line react/no-did-update-set-state
                this.setState({
                    validationStatus: 'Pending Validation ...',
                    validationErrors: null,
                });
                this.validateItemDebounced(this.props.value);
            }
        }
    }

    validateItemNotDebounced(item) {
        // TODO: Make sure race conditions are impossible!
        this.setState({ validationStatus: 'Validating ...' });
        window.api.send(`${this.props.dataType}-validate`, item)
            .then((validationErrors) => {
                this.setState({
                    validationStatus: null,
                    validationErrors,
                });
                if (this.state.autoSave && validationErrors.length === 0) {
                    this.props.onSave();
                }
            })
            .catch((error) => this.props.onError(error));
    }

    renderValidationErrors() {
        if (
            this.state.validationErrors
            && this.state.validationErrors.length
        ) {
            return (
                <div style={{ whiteSpace: 'pre-wrap' }}>
                    {this.state.validationErrors.join('\n')}
                </div>
            );
        } if (this.state.validationStatus) {
            return <div>{this.state.validationStatus}</div>;
        } if (this.props.isSaving) {
            return <div>Saving ...</div>;
        }
        return <div>No validation errors!</div>;
    }

    renderButtons() {
        return (
            <div>
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
                <Button
                    disabled={
                        this.state.validationStatus
                        || (
                            this.state.validationErrors
                            && this.state.validationErrors.length
                        )
                        || this.props.isSaving
                    }
                    onClick={() => (
                        this.state.autoSave
                            ? this.props.onChange(null)
                            : this.props.onSave()
                    )}
                    size="sm"
                    variant="secondary"
                    style={{ width: '50px' }}
                >
                    {this.state.autoSave ? 'Close' : 'Save'}
                </Button>
            </div>
        );
    }

    render() {
        if (!this.props.value) {
            return null;
        }
        const { EditorComponent } = this.props;
        return (
            <Modal
                show
                onHide={() => this.props.onChange(null)}
                onEscapeKeyDown={suppressUnlessShiftKey}
            >
                <Modal.Header closeButton>
                    <Modal.Title>Editor</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <EditorComponent
                        {...this.props.editorProps}
                        value={this.props.value}
                        onChange={(newValue) => this.props.onChange(newValue)}
                        onSpecialKeys={(event) => {
                            if (!event.shiftKey) return;
                            if (event.keyCode === KeyCodes.ENTER) {
                                this.props.onSave();
                            } else if (event.keyCode === KeyCodes.ESCAPE) {
                                this.props.onChange(null);
                            }
                        }}
                    />
                </Modal.Body>
                <Modal.Body>
                    <LeftRight>
                        {this.renderValidationErrors()}
                        {this.renderButtons()}
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
    editorProps: PropTypes.object,

    // eslint-disable-next-line react/forbid-prop-types
    value: PropTypes.object,
    onChange: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    onError: PropTypes.func.isRequired,
    isSaving: PropTypes.bool,
};

EditorModal.defaultProps = {
    editorProps: {},
    isSaving: false,
};


export default EditorModal;
