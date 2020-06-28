import Button from 'react-bootstrap/Button';
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
        this.state = {};
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
        window.api.send(`${this.props.dataType}-validate`, item)
            .then((validationErrors) => this.setState({
                validationStatus: null,
                validationErrors,
            }))
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
        }
        return <div>No validation errors!</div>;
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
                        selector={this.props.selector}
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
                        <Button
                            disabled={
                                this.state.validationStatus
                                || (
                                    this.state.validationErrors
                                    && this.state.validationErrors.length
                                )
                            }
                            onClick={() => this.props.onSave()}
                            size="sm"
                            variant="secondary"
                        >
                            Save
                        </Button>
                    </LeftRight>
                </Modal.Body>
            </Modal>
        );
    }
}


EditorModal.propTypes = {
    dataType: PropTypes.string.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    selector: PropTypes.object,
    EditorComponent: PropTypes.func.isRequired,

    // eslint-disable-next-line react/forbid-prop-types
    value: PropTypes.object,
    onChange: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    onError: PropTypes.func.isRequired,
};


export default EditorModal;
