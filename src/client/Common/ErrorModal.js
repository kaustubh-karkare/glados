import Modal from 'react-bootstrap/Modal';
import PropTypes from 'prop-types';
import React from 'react';
import { suppressUnlessShiftKey } from './Utils';

function ErrorModal(props) {
    let { error } = props;
    if (typeof error !== 'string') {
        error = JSON.stringify(error);
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
                    {error}
                </pre>
            </Modal.Body>
        </Modal>
    );
}

ErrorModal.propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    error: PropTypes.any,
    onClose: PropTypes.func.isRequired,
};

export default ErrorModal;
