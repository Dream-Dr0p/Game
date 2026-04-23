// ==================== src/dungeon/ChestNode.js ====================
import Node from './Node.js';
import Item from '../equipment/Weapon.js';

class ChestNode extends Node {
  constructor(id, type, neighbors, visited, isHidden, loot, isTrapped = false) {
    super(id, type, neighbors, visited, isHidden);
    this.loot = loot;
    this.isTrapped = isTrapped;
  }

  open() {}
}

export default ChestNode;