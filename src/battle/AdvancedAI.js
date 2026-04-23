// ==================== src/battle/AdvancedAI.js ====================
import AIBehavior from './AIBehavior.js';
import Battle from './Battle.js';
import Enemy from './Enemy.js';

class AdvancedAI extends AIBehavior {
  constructor(aggression, defenseTendency) {
    super();
    this.aggression = aggression;
    this.defenseTendency = defenseTendency;
  }

  /** @param {Battle} context @param {Enemy} self @returns {Action} */
  chooseAction(context, self) {}
}

export default AdvancedAI;