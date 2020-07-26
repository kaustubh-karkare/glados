import React from 'react';
import { LeftRight } from '../Common';

class ConsistencySection extends React.Component {
    constructor(props) {
        super(props);
        this.state = { isProcessing: false };
    }

    onClick() {
        if (this.state.isProcessing) return;
        this.setState({ isProcessing: true });
        window.api.send('consistency')
            .finally(() => this.setState({ isProcessing: false }));
    }

    render() {
        return (
            <LeftRight className="tab-item">
                <a href="#" onClick={() => this.onClick()}>Consistency</a>
                {this.state.isProcessing ? 'Processing!' : null}
            </LeftRight>
        );
    }
}

export default ConsistencySection;
