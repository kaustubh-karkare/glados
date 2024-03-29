import PropTypes from 'prop-types';
import React from 'react';

import {
    Coordinator, InputLine,
} from '../Common';

class LogStructureDetailsHeader extends React.Component {
    static onSearchButtonClick(logStructure) {
        Coordinator.invoke('url-update', { search: [logStructure] });
    }

    render() {
        const { logStructure } = this.props;
        return (
            <InputLine overflow styled className="px-2">
                {logStructure.logStructureGroup.name}
                {' / '}
                {logStructure.name}
            </InputLine>
        );
    }
}

LogStructureDetailsHeader.propTypes = {
    logStructure: PropTypes.Custom.LogStructure.isRequired,
};

export default LogStructureDetailsHeader;
