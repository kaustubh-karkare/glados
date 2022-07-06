import PropTypes from 'prop-types';
import React from 'react';

import {
    BulletList, DetailsIcon, InfoIcon, LeftRight, Link, TextEditor, WarningIcon,
} from '../Common';
import LogStructureEditor from './LogStructureEditor';

function LogStructureViewer(props) {
    const { logStructure, showDetails } = props;
    if (!showDetails) {
        return (
            <Link logStructure={logStructure}>
                {logStructure.name}
                <DetailsIcon isShown={!!logStructure.details} />
                <InfoIcon isShown={!!logStructure.eventAllowDetails} />
                <WarningIcon isShown={logStructure.isDeprecated} />
            </Link>
        );
    }
    let suffix;
    if (logStructure.isPeriodic) {
        if (logStructure.frequencyArgs) {
            suffix = `(${logStructure.frequency}: ${logStructure.frequencyArgs})`;
        } else {
            suffix = `(${logStructure.frequency})`;
        }
    }
    return (
        <LeftRight>
            <span>
                <TextEditor
                    unstyled
                    disabled
                    value={logStructure.eventTitleTemplate}
                    isSingleLine
                />
                <DetailsIcon isShown={!!logStructure.details} />
                <InfoIcon isShown={!!logStructure.eventAllowDetails} />
                <WarningIcon isShown={logStructure.isDeprecated} />
            </span>
            {suffix}
        </LeftRight>
    );
}

LogStructureViewer.propTypes = {
    logStructure: PropTypes.Custom.LogStructure.isRequired,
    showDetails: PropTypes.bool,
};

function LogStructureList(props) {
    return (
        <BulletList
            {...props}
            name="Structures"
            dataType="log-structure"
            valueKey="logStructure"
            ViewerComponent={LogStructureViewer}
            EditorComponent={LogStructureEditor}
        />
    );
}

LogStructureList.Single = (props) => (
    <BulletList.Item
        dataType="log-structure"
        value={props.logStructure}
        valueKey="logStructure"
        ViewerComponent={LogStructureViewer}
        EditorComponent={LogStructureEditor}
    />
);

LogStructureList.Single.propTypes = {
    logStructure: PropTypes.Custom.LogStructure.isRequired,
};

export default LogStructureList;
