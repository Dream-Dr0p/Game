// ==================== src/dungeon/Node.js ====================
import NodeType from '../enums/NodeType.js';
import Character from '../core/Character.js';

class Node {
  constructor(id, type, neighbors, visited = false, isHidden = false) {
    this.id = id;
    this.type = type; // NodeType
    this.neighbors = neighbors;
    this.visited = visited;
    this.isHidden = isHidden;
  }

  /** @param {Character} c */
  enter(c) {}
}

export default Node;