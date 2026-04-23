// ==================== src/battle/Battle.js ====================
import Character from '../core/Character.js';
import Enemy from './Enemy.js';
import GridMap from './GridMap.js';
import ActionBar from './ActionBar.js';
import StatusEffect from '../status/StatusEffect.js';

class Battle {
  constructor(player, enemies, grid, actionBar) {
    this.player = player;
    this.enemies = enemies;
    this.grid = grid;
    this.actionBar = actionBar;
    this.currentTurn = 0;
    this.totalRounds = 0;
    this.activeFloorModifiers = [];
  }

  startBattle() {}
  endBattle() {}
  checkVictory() {}
  checkEscape() {}
  /** @param {StatusEffect[]} modifiers */
  applyFloorModifiers(modifiers) {}
}

export default Battle;