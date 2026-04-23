// ==================== src/battle/BodyPart.js ====================
import Armor from '../equipment/Armor.js';
import Unit from './Unit.js';

class BodyPart {
  constructor(name, healthRatio, armor = null) {
    this.name = name;
    this.healthRatio = healthRatio;
    this.currentHealth = 0;
    this.armor = armor;
    this.isDisabled = false;
  }

  /** @param {Unit} owner */
  init(owner) {}
  /** @param {number} dmg */
  takeDamage(dmg) {}
  applyDisability() {}
  /** @returns {number} */
  getHealthPercent() {}
}

export default BodyPart;