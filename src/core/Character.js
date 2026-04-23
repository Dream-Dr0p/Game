// ==================== src/core/Character.js ====================
import Skill from './Skill.js';
import Weapon from '../equipment/Weapon.js';
import Armor from '../equipment/Armor.js';
import Backpack from '../equipment/Backpack.js';
import Status from '../status/Status.js';
import WeaponType from '../enums/WeaponType.js';
import AttributeType from '../enums/AttributeType.js';
import Unit from '../battle/Unit.js';

class Character extends Unit {
  /**
   * @param {string} id
   * @param {string} name
   */
  constructor(id, name) {
    super();
    this.id = id;
    this.name = name;
    this.strength = 0;
    this.agility = 0;
    this.constitution = 0;
    this.weapon = null;
    this.armors = []; // 6个部位
    this.backpack = null;
    this.skills = new Map(); // WeaponType -> Skill
    this.statuses = [];
    this.floor = 0;
    this.currency = 0;
    this.battleSkillHits = new Map(); // WeaponType -> hit count in current battle
    this.adventureStartAttributes = new Map(); // AttributeType -> start value
  }

  /** @param {Weapon} w */
  equipWeapon(w) {}

  /** @param {Armor} a @param {number} slot */
  equipArmor(a, slot) {}

  /** @param {number} dmg @param {BodyPart} part */
  takeDamage(dmg, part) {}

  die() {}

  gainPermanentGrowth() {}

  /**
   * @param {AttributeType} attr
   * @param {number} amount
   * @param {WeaponType} [weaponType]
   */
  increaseAttribute(attr, amount, weaponType = null) {}

  /** @param {WeaponType} type @returns {number} */
  getSkillExperienceBonus(type) {}

  /** @param {WeaponType} type @param {number} baseGain */
  addSkillExperience(type, baseGain) {}

  recordAdventureStartAttributes() {}

  calculatePermanentGrowth() {}

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

  /** @param {Character} c @returns {Character} */
  static createCharacter(c) {}
}

export default Character;