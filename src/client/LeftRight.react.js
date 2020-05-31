import React from 'react';

class LeftRight extends React.Component {
    render() {
        return (
            <div className="d-flex">
                <div className="mr-auto">{this.props.children[0]}</div>
                <div>{this.props.children[1]}</div>
            </div>
        );
    }
}

export default LeftRight;
