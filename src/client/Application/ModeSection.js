import InputGroup from 'react-bootstrap/InputGroup';
import React from 'react';
import PropTypes from '../prop-types';
import {
    Dropdown, LeftRight, SidebarSection,
} from '../Common';
import { getVirtualID } from '../../data';

const NONE_OPTION = {
    id: getVirtualID(),
    name: '(none)',
};

function ModeSection(props) {
    return (
        <SidebarSection>
            <LeftRight>
                Mode
                <InputGroup>
                    <Dropdown
                        options={{ name: 'log-mode-list' }}
                        prefixOptions={[NONE_OPTION]}
                        disabled={props.disabled}
                        onChange={(newLogMode) => {
                            if (newLogMode.id === NONE_OPTION.id) {
                                props.onChange(null);
                            } else {
                                props.onChange(newLogMode);
                            }
                        }}
                    >
                        <a href="#">
                            {props.logMode ? props.logMode.name : NONE_OPTION.name}
                        </a>
                    </Dropdown>
                </InputGroup>
            </LeftRight>
        </SidebarSection>
    );
}

ModeSection.propTypes = {
    logMode: PropTypes.Custom.Item,
    disabled: PropTypes.bool.isRequired,
    onChange: PropTypes.func.isRequired,
};

export default ModeSection;
