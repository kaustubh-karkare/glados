import InputGroup from 'react-bootstrap/InputGroup';
import React from 'react';
import PropTypes from '../prop-types';
import {
    Dropdown, LeftRight, SidebarSection, TypeaheadOptions,
} from '../Common';
import { getVirtualID } from '../../data';

const NONE_OPTION = {
    __id__: getVirtualID(),
    name: '(none)',
};

function ModeSection(props) {
    return (
        <SidebarSection>
            <LeftRight>
                Mode
                <InputGroup>
                    <Dropdown
                        options={new TypeaheadOptions({
                            serverSideOptions: [{ name: 'log-mode' }],
                            prefixOptions: [NONE_OPTION],
                        })}
                        disabled={props.disabled}
                        onChange={(newLogMode) => {
                            if (newLogMode.__id__ === NONE_OPTION.__id__) {
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
