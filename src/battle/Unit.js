// ==================== src/battle/Unit.js ====================
import BodyPart from './BodyPart.js';
import Weapon from '../equipment/Weapon.js';
import Status from '../status/Status.js';

class Unit {
  constructor() {
    this.pos = { x: 0, y: 0 };
    this.health = 0;
    this.maxHealth = 0;
    this.agility = 0;
    this.weapon = null;
    this.statuses = [];
    this.actionBarProgress = 0;
  }

  /** @returns {number} */
  getMoveRange() {}

  /** @returns {number} */
  getSpeed() {}

  /** @param {Action} action */
  act(action) {}

  /** @param {WeaponType} type @returns {number} */
  getSkillValue(type) {}

  /** @returns {number} */
  getCurrentWeaponSkill() {}
}

export default Unit;