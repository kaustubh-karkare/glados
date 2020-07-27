import './Bootstrap';
import './index.css';

import React from 'react';
import ReactDOM from 'react-dom';
import io from 'socket.io-client';
import SocketRPC from '../common/SocketRPC';
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
        (error) => Coordinator.invoke('modal-error', error),
    );

    ReactDOM.render(
        <Application />,
        document.getElementById('root'),
    );
};
