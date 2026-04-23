// ==================== src/dungeon/BattleNode.js ====================
import Node from './Node.js';
import Enemy from '../battle/Enemy.js';
import Battle from '../battle/Battle.js';
import Item from '../equipment/Weapon.js'; // or generic Item

class BattleNode extends Node {
  constructor(id, type, neighbors, visited, isHidden, enemies) {
    super(id, type, neighbors, visited, isHidden);
    this.enemies = enemies;
  }

  /** @param {Battle} battle */
  onClear(battle) {}
  /** @param {Item[]} loot @param {number} totalRounds @returns {Item[]} */
  applyDamageToLoot(loot, totalRounds) {}
}

export default BattleNode;