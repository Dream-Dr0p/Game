// ==================== src/dungeon/RestNode.js ====================
import Node from './Node.js';

class RestNode extends Node {
  constructor(id, type, neighbors, visited, isHidden) {
    super(id, type, neighbors, visited, isHidden);
  }

  healOption() {}
  removeStatusOption() {}
}

export default RestNode;