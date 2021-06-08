export function aStar (grid, startNode, finishNode) {
    const visitedNodesInOrder = [];
    startNode.distance = 0;
    const unvisitedNodes = getAllNodes(grid);
    while (!!unvisitedNodes.length) {
      unvisitedNodes.sort((nodeA, nodeB) => ((nodeA.distance - nodeB.distance)));
      sortNodesByDistance(unvisitedNodes, finishNode);
      const closestNode = unvisitedNodes.shift();
      // If we encounter a wall, we skip it.
      if (closestNode.status == "wall") continue;
      // If the closest node is at a distance of infinity,
      // we must be trapped and should therefore stop.
      if (closestNode.distance === Infinity) return visitedNodesInOrder;
      if (closestNode.weight > 0) {
        closestNode.weight -= 1;
        closestNode.distance += 1;
        unvisitedNodes.push(closestNode);
      }
      else {
        closestNode.isVisited = true;
        visitedNodesInOrder.push(closestNode);
        if (closestNode.status == "finish") return visitedNodesInOrder;
        updateUnvisitedNeighbors(closestNode, grid);
      }
    }
  }
  
  function sortNodesByDistance(unvisitedNodes, finishNode) {
    unvisitedNodes.sort((nodeA, nodeB) => ((nodeA.distance + Math.abs(nodeA.row - finishNode.row) + Math.abs(nodeA.col - finishNode.col)) - (nodeB.distance + Math.abs(nodeB.row - finishNode.row) + Math.abs(nodeB.col - finishNode.col))));
  }
  
  function updateUnvisitedNeighbors(node, grid) {
    const unvisitedNeighbors = getUnvisitedNeighbors(node, grid);
    for (const neighbor of unvisitedNeighbors) {
      neighbor.distance = node.distance + 1;
      if (!neighbor.previousNode || neighbor.previousNode.distance > node.distance) {
        neighbor.previousNode = node;
      }
    }
  }
  
  function getUnvisitedNeighbors(node, grid) {
    const neighbors = [];
    const {col, row} = node;
    if (row > 0) neighbors.push(grid[row - 1][col]);
    if (row < grid.length - 1) neighbors.push(grid[row + 1][col]);
    if (col > 0) neighbors.push(grid[row][col - 1]);
    if (col < grid[0].length - 1) neighbors.push(grid[row][col + 1]);
    return neighbors.filter(neighbor => !neighbor.isVisited);
  }
  
  function getAllNodes(grid) {
    const nodes = [];
    for (const row of grid) {
      for (const node of row) {
        nodes.push(node);
      }
    }
    return nodes;
  }
  
  // Backtracks from the finishNode to find the shortest path.
  // Only works when called *after* the dijkstra method above.
  export function getNodesInShortestPathOrder(finishNode) {
    var nodesInShortestPathOrder = [];
    let currentNode = finishNode;
    while (currentNode !== null) {
      nodesInShortestPathOrder.unshift(currentNode);
      currentNode = currentNode.previousNode;
    }
    return nodesInShortestPathOrder;
  }
  