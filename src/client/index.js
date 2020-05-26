import React from 'react';
import ReactDOM from 'react-dom';
import io from 'socket.io-client';
import SocketRPC from '../common/socket_rpc';

const port = document.getElementById("server-port").value;
const api = new SocketRPC(io('localhost:' + port));

import CategoryEditor from './CategoryEditor.react';

class SquareTest extends React.Component {
  constructor(props) {
    super(props);
    this.state = {value: '2'};
  }
  render() {
    return (
      <div>
        <input type='input' value={this.state.value} onChange={this.onChange.bind(this)} />
        <input type='button' value='Square!' onClick={this.onClick.bind(this)} />
      </div>
    );
  }
  onChange(event) {
    this.setState({value: event.target.value});
  }
  onClick() {
    api.send('square', this.state.value)
      .then(value => this.setState({value}));
  }
}

ReactDOM.render(
  <div>
    <CategoryEditor />
  </div>,
  document.getElementById('app')
);
