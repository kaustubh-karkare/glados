import React from 'react';
import assert from '../../common/assert';
import ErrorModal from './ErrorModal';

class ModalStack extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            components: [],
        };
        window.modalStack_push = this.push.bind(this);
        window.modalStack_displayError = (error) => this.push(ErrorModal, { error });
    }

    push(ComponentClass, componentProps) {
        const index = this.state.components.length;
        this.setState((state) => {
            state.components.push({ ComponentClass, componentProps });
            return state;
        });
        return this.pop.bind(this, index);
    }

    pop(index) {
        this.setState((state) => {
            state.components.pop();
            assert(index === state.components.length);
            return state;
        });
    }

    renderItem({ ComponentClass, componentProps }, index) {
        return (
            <ComponentClass
                key={index}
                {...componentProps}
                onClose={() => this.pop(index)}
            />
        );
    }

    render() {
        return this.state.components.map((item, index) => this.renderItem(item, index));
    }
}

export default ModalStack;
