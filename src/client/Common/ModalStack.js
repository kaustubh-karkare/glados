import React from 'react';
import assert from 'assert';
import Coordinator from './Coordinator';
import EditorModal from './EditorModal';
import ErrorModal from './ErrorModal';

class ModalStack extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            components: [],
        };
    }

    componentDidMount() {
        this.deregisterCallbacks = [
            Coordinator.register('modal', this.push.bind(this)),
            Coordinator.register(
                'modal-editor',
                (componentProps) => this.push(EditorModal, componentProps),
            ),
            Coordinator.register('modal-error', (error) => this.push(ErrorModal, { error })),
        ];
    }

    componentWillUnmount() {
        this.deregisterCallbacks.forEach((deregisterCallback) => deregisterCallback());
    }

    push(ComponentClass, componentProps) {
        const index = this.state.components.length;
        this.setState((state) => {
            state.components.push({ ComponentClass, componentProps });
            return state;
        });
        return this.pop.bind(this, index);
    }

    pop(index, callback) {
        this.setState((state) => {
            state.components.pop();
            assert(index === state.components.length);
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
