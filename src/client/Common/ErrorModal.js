import Modal from 'react-bootstrap/Modal';
import PropTypes from 'prop-types';
import React from 'react';

function suppressUnlessShiftKey(event) {
    if (!event.shiftKey) {
        event.preventDefault();
    }
}

function ErrorModal(props) {
    if (!props.error) {
        return null;
    }
    return (
        <Modal
            show
            onHide={props.onClose}
            onEscapeKeyDown={suppressUnlessShiftKey}
        >
            <Modal.Header closeButton>
                <Modal.Title>Error</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <pre>
                    {props.error}
                </pre>
            </Modal.Body>
        </Modal>
    );
}

ErrorModal.propTypes = {
    error: PropTypes.string,
    onClose: PropTypes.func.isRequired,
};

export default ErrorModal;
