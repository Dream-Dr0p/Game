// ==================== src/battle/Enemy.js ====================
import Unit from './Unit.js';
import Weapon from '../equipment/Weapon.js';
import Armor from '../equipment/Armor.js';
import Skill from '../core/Skill.js';
import WeaponType from '../enums/WeaponType.js';
import AIBehavior from './AIBehavior.js';
import EnemyTemplate from './EnemyTemplate.js';

class Enemy extends Unit {
  constructor(name, strength, constitution, skills, weapon, armors, bodyParts, ai) {
    super();
    this.name = name;
    this.strength = strength;
    this.constitution = constitution;
    this.skills = new Map(); // WeaponType -> Skill
    this.weapon = weapon;
    this.armors = armors;
    this.bodyParts = bodyParts;
    this.ai = ai;
  }

  act() {}
  /** @param {WeaponType} type @returns {number} */
  getSkillValue(type) {}
  /** @param {EnemyTemplate} template @returns {Enemy} */
  static fromTemplate(template) {}
}

export default Enemy;