import React, {Component} from 'react';
import Node from './Node/Node';
import {dijkstra, getNodesInShortestPathOrder} from '../algorithms/dijkstra';
import {aStar} from '../algorithms/aStar';

import './PathfindingVisualizer.css';

const listOfColors = [["rgba(0, 217, 159, 0.75)","rgb(0, 255, 128)","rgb(149, 147, 255)","rgb(0, 221, 255)"],
  ["rgb(158, 0, 0)","rgb(255, 0, 0)","rgb(255, 97, 158)","rgb(255, 146, 146)"],
  ["rgb(255, 217, 0)","rgb(179, 255, 0)","rgb(255, 251, 0)","rgb(253, 255, 146)"],
  ["rgb(0, 33, 48)","rgb(31, 0, 170)","rgb(0, 255, 242)","rgb(101, 111, 255)"],
  ["rgb(51, 0, 85)","rgb(255, 122, 215)","rgb(153, 0, 255)","rgb(199, 101, 255)"],
  ["rgb(0, 33, 48)","rgb(255, 255, 255)","rgb(0, 0, 0)","rgb(235, 235, 235)"]
]

const dijkstrasDescription = "Dijkstra's algorithm finds the shortest between two nodes in a graph by visiting each node in a BFS manner. The algorithm adds neighbouring nodes to a pririty queue and greedily visits nodes that are shortest to the starting node until it finds the destination node"
const aStarDescription = "A* (pronounced \"A-star\") is an informed search algorithm that finds the shortest path between two nodes in a graph. This algorithm greedily visits neighbouring nodes that have a shorter distance to the destination node. It is widely considered to be more efficient than Dijkstra's."

export default class PathfindingVisualizer extends Component {
  constructor() {
    super();
    this.state = {
      grid: [],
      algorithm: "dijkstra",
      mouseIsPressed: false,
      isVisualized: false,
      isVisualizing: false,
      isDraggingStartNode: false,
      isDraggingFinishNode: false,
      startNodeRow: 11,
      startNodeCol: 14,
      finishNodeRow: 11,
      finishNodeCol: 45,
      drawType: "wall",
      visualizeSpeed: 12,
      visualizeColor: 1,
    };
  }

  dragNode(row, col) {
    if (this.state.grid[row][col].status == "wall" || this.state.grid[row][col].status == "weight") {
      return
    }
    if (this.state.isDraggingStartNode) {
      this.state.grid[this.state.startNodeRow][this.state.startNodeCol].status = "normal"
      this.state.grid[row][col].status = "start"
      this.setState({startNodeRow: row, startNodeCol: col});
    }
    else if (this.state.isDraggingFinishNode) {
      this.state.grid[this.state.finishNodeRow][this.state.finishNodeCol].status = "normal"
      this.state.grid[row][col].status = "finish"
      this.setState({finishNodeRow: row, finishNodeCol: col});
    }
    
  }

  componentDidMount() {
    const grid = this.getInitialGrid();    
    this.setState({grid});
  }

  handleMouseDown(event, row, col) {
    event.preventDefault()
    if (this.state.isVisualizing) return;
    if (this.state.grid[row][col].status == "start" || this.state.grid[row][col].status == "finish") {
      this.setState({isDraggingStartNode: this.state.grid[row][col].status == "start", isDraggingFinishNode: this.state.grid[row][col].status == "finish"});
      return
    }
    if (this.state.isDraggingStartNode || this.state.isDraggingFinishNode) {
      this.dragNode(row, col)
      return
    }
    this.setState({mouseIsPressed: true});
    if (this.state.grid[row][col].status != "start" &&  this.state.grid[row][col].status != "finish") {
      this.toggleNode(row, col)
    }
  }

  async handleMouseEnter(event, row, col) {
    event.preventDefault()
    if (this.state.isVisualizing) return;
    if (this.state.isDraggingStartNode || this.state.isDraggingFinishNode) {
      await this.dragNode(row, col);
      if (this.state.isVisualized) {
        this.instantVisualize();
      }
      return;
    }
    if (!this.state.mouseIsPressed) return;
    if (this.state.grid[row][col].status != "start" &&  this.state.grid[row][col].status != "finish") {
      this.toggleNode(row, col)
    }
  }

  handleMouseUp() {
    if (this.state.isVisualizing) return;
    this.setState({mouseIsPressed: false, isDraggingStartNode: false, isDraggingFinishNode: false});
  }

  toggleNode(row, col) {
    if(this.state.grid[row][col].status == "wall" || this.state.grid[row][col].status == "weight") {
      this.state.grid[row][col].status = "normal";
      this.setState({});
    }
    else {
      this.state.grid[row][col].status = this.state.drawType;
      if (this.state.drawType == "weight") {
        this.state.grid[row][col].weight = 10
      }
      this.setState({});
    }
    if (this.state.isVisualized == true) {
      const newGrid = this.resetGrid(this.state.grid);
      this.setState({grid: newGrid, isVisualized: false});
    }
  }

  handleChangeAlgo(algo) {
    this.setState({algorithm: algo});
    document.getElementById("select-dijkstra").className = "algorithm-selector-button";
    document.getElementById("select-aStar").className = "algorithm-selector-button";
    document.getElementById("select-"+algo).className = "selected-algo";
    if (algo == "dijkstra") {
      document.getElementById("algorithm-description-header").innerHTML = "Dijkstra's Algorithm";
      document.getElementById("algorithm-description-paragraph").innerHTML = dijkstrasDescription;
    } else if (algo == "aStar") {
      document.getElementById("algorithm-description-header").innerHTML = "A* Search";
      document.getElementById("algorithm-description-paragraph").innerHTML = aStarDescription;
    }
  }

  handleDrawToggle() {
    var drawToggle = document.getElementById("draw-toggle");
    if (drawToggle.checked) {
      this.setState({drawType: "weight"});
      document.getElementById("select-weights").className = "checkbox-description"
      document.getElementById("select-walls").className = "invisible"
    }
    else if (!drawToggle.checked) {
      this.setState({drawType: "wall"});
      document.getElementById("select-weights").className = "invisible"
      document.getElementById("select-walls").className = "checkbox-description"
    }
  }

  handleChangeSpeed() {
    const slider = document.getElementById("speedSlider");
    this.setState({visualizeSpeed: 25 - slider.value});
  }

  instantVisualize() {
    const newGrid = this.resetGrid(this.state.grid)
    console.log(newGrid)
    this.setState({grid: newGrid});
    const {grid} = this.state;
    const startNode = grid[this.state.startNodeRow][this.state.startNodeCol];
    const finishNode = grid[this.state.finishNodeRow][this.state.finishNodeCol];
    if (this.state.algorithm == "dijkstra") {
      var visitedNodesInOrder = dijkstra(grid, startNode, finishNode);
    }
    else if (this.state.algorithm == "aStar") {
      var visitedNodesInOrder = aStar(grid, startNode, finishNode);
    }
    var nodesInShortestPathOrder = getNodesInShortestPathOrder(finishNode);
    for (let i = 0; i <= visitedNodesInOrder.length; i++) {
      if (i === visitedNodesInOrder.length) {
        for (let i = 0; i < nodesInShortestPathOrder.length; i++) {
          const node = nodesInShortestPathOrder[i];
          if (node.status == "weight") {
            document.getElementById(`node-${node.row}-${node.col}`).className =
              'node node-instant-shortest-path node-weight';
          } else if (node.status == "start") {
            document.getElementById(`node-${node.row}-${node.col}`).className =
              'node node-instant-shortest-path node-start';
          } else if (node.status == "finish") {
            document.getElementById(`node-${node.row}-${node.col}`).className =
              'node node-instant-shortest-path node-finish';
          } else if (node.status == "normal") {
            document.getElementById(`node-${node.row}-${node.col}`).className =
              'node node-instant-shortest-path';
          }
        }
        return;
      }
      const node = visitedNodesInOrder[i];
      if (node.status == "weight") {
        document.getElementById(`node-${node.row}-${node.col}`).className =
          'node node-instant-visited node-weight';
      } else if (node.status == "normal") {
        document.getElementById(`node-${node.row}-${node.col}`).className =
          'node node-instant-visited';
      }       
    }
  }

  animateAlgorithm(visitedNodesInOrder, nodesInShortestPathOrder) {
    const speed = this.state.visualizeSpeed
    for (let i = 0; i <= visitedNodesInOrder.length; i++) {
      if (i === visitedNodesInOrder.length) {
        setTimeout(() => {
          this.animateShortestPath(nodesInShortestPathOrder);
        }, speed * i);
        return;
      }
      setTimeout(() => {
        const node = visitedNodesInOrder[i];
        if (node.status == "weight") {
          document.getElementById(`node-${node.row}-${node.col}`).className =
            'node node-visited node-weight';
        } else if (node.status == "start") {
          document.getElementById(`node-${node.row}-${node.col}`).className =
            'node node-visited node-start';
        } else if (node.status == "finish") {
          document.getElementById(`node-${node.row}-${node.col}`).className =
            'node node-visited node-finish';
        } else if (node.status == "normal") {
          document.getElementById(`node-${node.row}-${node.col}`).className =
            'node node-visited';
        }       
      }, speed * i);
    }
  }

  animateShortestPath(nodesInShortestPathOrder) {
    const speed = this.state.visualizeSpeed
    const nodesLength = nodesInShortestPathOrder.length
    for (let i = 0; i < nodesInShortestPathOrder.length; i++) {
      setTimeout(() => {
        const node = nodesInShortestPathOrder[i];
        if (node.status == "weight") {
          document.getElementById(`node-${node.row}-${node.col}`).className =
            'node node-shortest-path node-weight';
        } else if (node.status == "start") {
          document.getElementById(`node-${node.row}-${node.col}`).className =
            'node node-shortest-path node-start';
        } else if (node.status == "finish") {
          document.getElementById(`node-${node.row}-${node.col}`).className =
            'node node-shortest-path node-finish';
        } else if (node.status == "normal") {
          document.getElementById(`node-${node.row}-${node.col}`).className =
            'node node-shortest-path';
        }       
      }, speed * 5.5 * i);
    }
    setTimeout(() => {this.setState({isVisualizing: false})},speed * 4.5 * nodesLength)
    
  }

  async visualizeAlgorithm() {
    if (this.state.isVisualizing) return;
    this.setState({isVisualizing: true});
    var newColor = Math.floor(Math.random()*6);
    while (newColor == this.state.visualizeColor) {
      var newColor = Math.floor(Math.random()*6);
    }
    document.documentElement.style.setProperty('--visualization-color-1', listOfColors[newColor][0]);
    document.documentElement.style.setProperty('--visualization-color-2', listOfColors[newColor][1]);
    document.documentElement.style.setProperty('--visualization-color-3', listOfColors[newColor][2]);
    document.documentElement.style.setProperty('--visualization-color-4', listOfColors[newColor][3]);
    const newGrid = this.resetGrid(this.state.grid)
    await this.setState({grid: newGrid, visualizeColor: newColor});
    
    const {grid} = this.state;
    console.log(grid,this.state.visualizeColor)
    const startNode = grid[this.state.startNodeRow][this.state.startNodeCol];
    const finishNode = grid[this.state.finishNodeRow][this.state.finishNodeCol];
    if (this.state.algorithm == "dijkstra") {
      var visitedNodesInOrder = dijkstra(grid, startNode, finishNode);
    }
    else if (this.state.algorithm == "aStar") {
      var visitedNodesInOrder = aStar(grid, startNode, finishNode);
    }

    var nodesInShortestPathOrder = getNodesInShortestPathOrder(finishNode);
    this.animateAlgorithm(visitedNodesInOrder, nodesInShortestPathOrder);
    this.setState({isVisualized: true});
    console.log(this.state.grid)
  }

  resetGrid(grid) {
    const newGrid = [];
    for (let row = 0; row < 22; row++) {
      const currentRow = [];
      for (let col = 0; col < 58; col++) {
        var node = grid[row][col]
        currentRow.push(this.createNode(col, row, node.status));
        if (node.status != "wall") {
          if (node.status == "weight") {
            document.getElementById(`node-${node.row}-${node.col}`).className =
              'node node-weight';
          } else if (node.status == "start") {
            document.getElementById(`node-${node.row}-${node.col}`).className =
              'node node-start';
          } else if (node.status == "finish") {
            document.getElementById(`node-${node.row}-${node.col}`).className =
              'node node-finish';
          } else if (node.status == "normal") {
            document.getElementById(`node-${node.row}-${node.col}`).className =
              'node';
          }                    
        }
      }
      newGrid.push(currentRow);
    }
    return newGrid;
  };


  getInitialGrid() {
    const grid = [];
    for (let row = 0; row < 22; row++) {
      const currentRow = [];
      for (let col = 0; col < 58; col++) {
        if (col == this.state.finishNodeCol && row == this.state.finishNodeRow) {
          currentRow.push(this.createNode(col, row, "finish"));
        }
        else if (col == this.state.startNodeCol && row == this.state.startNodeRow) {
          currentRow.push(this.createNode(col, row, "start"));
        }
        else {
          currentRow.push(this.createNode(col, row, "normal"));
        }
      }
      grid.push(currentRow);
    }
    return grid;
  };

  createNode(col, row, status) {
    return {
      col,
      row,
      status,
      distance: Infinity,
      weight: status=="weight" ? 10 : 0,
      isVisited: false,
      previousNode: null,
    };
  };


  render() {
    const {grid, mouseIsPressed} = this.state;

    return (
      <div onMouseUp={() => this.handleMouseUp()}>
        <div id="top">
          <div class="algorithm-selector-container">
            <div class="algorithm-selector">
              <button id="select-dijkstra" class="selected-algo" onClick={() => this.handleChangeAlgo("dijkstra")}>Dijkstra's Algorithm</button>
              <button id="select-aStar" class="algorithm-selector-button" onClick={() => this.handleChangeAlgo("aStar")}>A* Search</button>
            </div>  
          </div>
          <div id="algorithm-description-container">
            <h2 id="algorithm-description-header">Dijkstra's Algorithm</h2>
            <p id="algorithm-description-paragraph">{dijkstrasDescription}</p>
          </div>
          <button id="visualize-button" onClick={() => this.visualizeAlgorithm()}>
            VISUALIZE
          </button>
          <label class="switch">
            <div id="select-weights" class="invisible"></div>
            <div id="select-walls" class="checkbox-description"></div>
            <input type="checkbox" id="draw-toggle" onClick={() => this.handleDrawToggle()}/>
            <span class="slider"></span>
          </label>
          <input id ="speedSlider" type="range" min="7" max="20" onInput={() => this.handleChangeSpeed()}></input>
        </div>
        <div className="grid">
          {grid.map((row, rowIdx) => {
            return (
              <div key={rowIdx} class="row">
                {row.map((node, nodeIdx) => {
                  const {row, col, status} = node;
                  return (
                    <Node
                      key={nodeIdx}
                      col={col}
                      status={status}
                      mouseIsPressed={mouseIsPressed}
                      onMouseDown={(event, row, col) => this.handleMouseDown(event, row, col)}
                      onMouseEnter={(event, row, col) =>
                        this.handleMouseEnter(event, row, col)
                      }
                      onMouseUp={() => this.handleMouseUp()}
                      row={row}></Node>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}

const getNewGridWithNodeToggled = (grid, row, col, drawType) => {
  const newGrid = grid.slice();
  const node = newGrid[row][col];
  if (drawType == "wall") {
    var newNode = {
      ...node,
      isWall: !node.isWall,
    };
  }
  else if (drawType == "weight") {
    var newNode = {
      ...node,
      isWeight: !node.isWeight,
      weight: 10,
    };
  }
  newGrid[row][col] = newNode;
  return newGrid;
};