import PropTypes from 'prop-types';
import React from 'react';

import {
    InputLine, TextEditor,
} from '../Common';

class LogEventDetailsHeader extends React.Component {
    renderTitle() {
        const { logEvent } = this.props;
        return (
            <InputLine styled className="px-2">
                <TextEditor
                    isSingleLine
                    unstyled
                    disabled
                    value={logEvent.title}
                />
            </InputLine>
        );
    }

    render() {
        return this.renderTitle();
    }
}

LogEventDetailsHeader.propTypes = {
    logEvent: PropTypes.Custom.LogEvent.isRequired,
};

export default LogEventDetailsHeader;
