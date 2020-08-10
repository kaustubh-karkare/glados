import './Bootstrap';
import './index.css';
import './prop-types'; // Load PropTypes.Custom

import React from 'react';
import ReactDOM from 'react-dom';
import io from 'socket.io-client';
import SocketRPC from '../common/SocketRPC';
import { isVirtualItem } from '../data';
import { Coordinator } from './Common';
import { Application } from './Application';

function initCookies() {
    document.cookies = document.cookie.split('; ').reduce((result, item) => {
        const [key, value] = item.split('=');
        // eslint-disable-next-line no-param-reassign
        result[key] = value;
        return result;
    }, {});
}

window.main = function main() {
    initCookies();
    window.api = SocketRPC.client(
        io(`${document.cookies.host}:${document.cookies.port}`),
        (name, input, output) => {
            const suffix = '-upsert';
            if (name.endsWith(suffix) && isVirtualItem(input)) {
                const dataType = name.substring(0, name.length - suffix.length);
                Coordinator.broadcast(`${dataType}-created`, output);
            }
        },
        (name, input, error) => Coordinator.invoke('modal-error', error),
    );

    ReactDOM.render(
        <Application />,
        document.getElementById('root'),
    );
};
