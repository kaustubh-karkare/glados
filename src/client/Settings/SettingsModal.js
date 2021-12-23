import InputGroup from 'react-bootstrap/InputGroup';
import Modal from 'react-bootstrap/Modal';
import React from 'react';
import PropTypes from 'prop-types';
import Button from 'react-bootstrap/Button';
import { suppressUnlessShiftKey } from '../Common/Utils';
import SettingsEditor from './SettingsEditor';
import { LeftRight } from '../Common';

class SettingsModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            settings: props.settings,
            isSaving: false,
        };
    }

    onSave() {
        this.setState({ isSaving: true });
        window.api.send('settings-set', this.state.settings)
            .then(() => this.setState({ isSaving: false }));
    }

    render() {
        return (
            <Modal
                show={this.props.isShown}
                onHide={() => {
                    this.setState({ settings: this.props.settings });
                    this.props.onClose();
                }}
                onEscapeKeyDown={suppressUnlessShiftKey}
            >
                <Modal.Header closeButton>
                    <Modal.Title>Settings</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <SettingsEditor
                        settings={this.state.settings}
                        disabled={this.state.isSaving}
                        onChange={(settings) => this.setState({ settings })}
                    />
                </Modal.Body>
                <Modal.Body>
                    <LeftRight>
                        <div />
                        <InputGroup>
                            <Button
                                disabled={this.state.isSaving}
                                onClick={() => this.onSave()}
                                style={{ width: '50px' }}
                            >
                                Save
                            </Button>
                        </InputGroup>
                    </LeftRight>
                </Modal.Body>
            </Modal>
        );
    }
}

SettingsModal.propTypes = {
    isShown: PropTypes.bool.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    settings: PropTypes.objectOf(PropTypes.any.isRequired).isRequired,
    onClose: PropTypes.func.isRequired,
};

export default SettingsModal;
