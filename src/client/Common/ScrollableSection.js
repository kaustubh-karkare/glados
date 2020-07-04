/* eslint-disable max-classes-per-file */

import React from 'react';
import PropTypes from 'prop-types';

class WindowHeightDetector {
    static subscribe(callback) {
        if (!WindowHeightDetector.instance) {
            WindowHeightDetector.instance = new WindowHeightDetector();
        }
        const { instance } = WindowHeightDetector;
        instance.callbacks.push(callback);
        return instance.height;
    }

    constructor() {
        this.callbacks = [];
        this.height = window.innerHeight;
        window.addEventListener('resize', this.onResize.bind(this));
    }

    onResize() {
        this.height = window.innerHeight;
        this.callbacks.forEach((callback) => callback(this.height));
    }
}

class ScrollableSection extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            height: WindowHeightDetector.subscribe((height) => this.setState({ height })),
        };
    }

    render() {
        const height = this.state.height - 30; // Why 30? 15px padding at top/bottom.
        return (
            <div className="scrollable-section" style={{ height, overflow: 'scroll' }}>
                {this.props.children}
            </div>
        );
    }
}

ScrollableSection.propTypes = {
    // eslint-disable-next-line react/forbid-prop-types
    children: PropTypes.any,
};

export default ScrollableSection;
