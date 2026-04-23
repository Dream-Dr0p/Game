// ==================== src/dungeon/DungeonFloor.js ====================
import Node from './Node.js';
import StatusEffect from '../status/StatusEffect.js';

class DungeonFloor {
  constructor(floorNumber, nodes, startNode, bossNode, floorModifiers) {
    this.floorNumber = floorNumber;
    this.nodes = nodes;
    this.startNode = startNode;
    this.bossNode = bossNode;
    this.floorModifiers = floorModifiers; // StatusEffect[]
  }

  generateMap() {}
}

export default DungeonFloor;