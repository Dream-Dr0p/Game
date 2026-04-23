// ==================== src/battle/ActionBar.js ====================
import Unit from './Unit.js';
import Action from './Action.js';

class ActionBar {
  constructor() {
    this.playerProgress = 0;
    this.enemyProgress = 0;
  }

  tick() {}
  /** @returns {boolean} */
  isPlayerTurn() {}
  /** @param {Unit} unit @param {Action} action */
  consumeAction(unit, action) {}
  recalcTurnOrder() {}
}

export default ActionBar;