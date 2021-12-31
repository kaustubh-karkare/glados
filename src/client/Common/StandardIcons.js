import { AiOutlineWarning } from 'react-icons/ai';
import { BiDetail } from 'react-icons/bi';
import { MdHelp, MdInfo } from 'react-icons/md';
import React from 'react';
import PropTypes from 'prop-types';

function getIconWrapper(Component, color = 'var(--link-color)', style = { cursor: 'pointer' }) {
    function IconWrapper(props) {
        const { isShown, ...moreProps } = props;
        if (!isShown) {
            return null;
        }
        return (
            <Component
                className="ml-1"
                color={color}
                style={style}
                {...moreProps}
            />
        );
    }
    IconWrapper.propTypes = {
        isShown: PropTypes.bool.isRequired,
    };
    return IconWrapper;
}

export const WarningIcon = getIconWrapper(AiOutlineWarning, 'var(--warning-color)', { position: 'relative', top: -1 });
export const DetailsIcon = getIconWrapper(BiDetail);
export const HelpIcon = getIconWrapper(MdHelp);
export const InfoIcon = getIconWrapper(MdInfo);
