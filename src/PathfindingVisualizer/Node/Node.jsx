import React, {Component} from 'react';

import './Node.css';

export default class Node extends Component {
  render() {
    const {
      col,
      status,
      onMouseDown,
      onMouseEnter,
      onMouseUp,
      row,
    } = this.props;
    const extraClassName = status == "finish"
      ? 'node-finish'
      : status == "start"
      ? 'node-start'
      : status == "wall"
      ? 'node-wall'
      : status == "weight"
      ? 'node-weight'
      : '';

    return (
      <div
        id={`node-${row}-${col}`}
        className={`node ${extraClassName}`}
        onMouseDown={(event) => onMouseDown(event, row, col)}
        onMouseEnter={(event) => onMouseEnter(event, row, col)}
        onMouseUp={() => onMouseUp()}></div>
    );
  }
}