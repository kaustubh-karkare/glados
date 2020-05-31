import React from 'react';
import ReactDOM from 'react-dom';
import io from 'socket.io-client';
import SocketRPC from '../common/socket_rpc';

import CategoryEditor from './CategoryEditor.react';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

function initCookies() {
  document.cookies = document.cookie.split("; ").reduce((result, item) => {
    const [key, value] = item.split("=");
    result[key] = value;
    return result;
  }, {});
}

window.main = function() {
  initCookies();
  window.api = new SocketRPC(io('localhost:' + document.cookies.port));

  ReactDOM.render(
    <Container fluid={true}>
      <Row>
        <Col md={2}>
          Left
        </Col>
        <Col md={8}>
          <CategoryEditor />
        </Col>
        <Col md={2}>
          Right
        </Col>
      </Row>
    </Container>,
    document.getElementById('root')
  );
};
