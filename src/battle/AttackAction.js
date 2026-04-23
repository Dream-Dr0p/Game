// ==================== src/battle/AttackAction.js ====================
import Action from './Action.js';
import BodyPart from './BodyPart.js';
import Unit from './Unit.js';

class AttackAction extends Action {
  constructor(target, targetPart, isVitalPart) {
    super(100); // cost
    this.target = target;
    this.targetPart = targetPart;
    this.isVitalPart = isVitalPart;
  }

  execute() {}
  /** @param {Unit} attacker @param {Unit} defender @returns {boolean} */
  calculateMiss(attacker, defender) {}
  /** @param {Unit} attacker @param {Unit} defender @param {BodyPart} part @returns {boolean} */
  calculateHitPart(attacker, defender, part) {}
  applyDamage() {}
}

export default AttackAction;