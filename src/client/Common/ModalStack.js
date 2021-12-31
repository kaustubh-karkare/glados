import React from 'react';
import assert from 'assert';
import Coordinator from './Coordinator';
import ConfirmModal from './ConfirmModal';
import EditorModal from './EditorModal';
import ErrorModal from './ErrorModal';
import InfoModal from './InfoModal';

class ModalStack extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            components: [],
            sourceElement: null,
        };
    }

    componentDidMount() {
        this.deregisterCallbacks = [
            Coordinator.register(
                'modal-editor',
                (componentProps) => this.push(EditorModal, componentProps),
            ),
            Coordinator.register('modal-confirm', this.push.bind(this, ConfirmModal)),
            Coordinator.register('modal-error', (error) => this.push(ErrorModal, { error })),
            Coordinator.register('modal-info', ({ title, message }) => this.push(InfoModal, { title, message })),
        ];
    }

    componentWillUnmount() {
        this.deregisterCallbacks.forEach((deregisterCallback) => deregisterCallback());
    }

    push(ComponentClass, componentProps) {
        const index = this.state.components.length;
        this.setState((state) => {
            if (index === 0) {
                state.sourceElement = document.activeElement;
            }
            state.components.push({ ComponentClass, componentProps });
            return state;
        });
        return this.pop.bind(this, index);
    }

    pop(index, callback) {
        this.setState((state) => {
            state.components.pop();
            assert(index === state.components.length);
            if (index === 0) {
                state.sourceElement.focus();
                state.sourceElement = null;
            }
            return state;
        }, callback);
    }

    renderItem({ ComponentClass, componentProps }, index) {
        return (
            <ComponentClass
                key={index}
                {...componentProps}
                onClose={(...args) => this.pop(index, () => {
                    if (componentProps.onClose) {
                        componentProps.onClose(...args);
                    }
                })}
            />
        );
    }

    render() {
        return this.state.components.map((item, index) => this.renderItem(item, index));
    }
}

export default ModalStack;
