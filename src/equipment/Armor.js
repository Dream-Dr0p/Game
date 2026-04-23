// ==================== src/equipment/Armor.js ====================
import BodyPartSlot from '../enums/BodyPartSlot.js';
import ArmorUpgradeType from '../enums/ArmorUpgradeType.js';

class Armor {
  constructor(id, name, defense, coverage, weight, slot) {
    this.id = id;
    this.name = name;
    this.defense = defense;
    this.coverage = coverage;
    this.weight = weight;
    this.slot = slot; // BodyPartSlot
    this.upgradeCount = 0;
  }

  /** @param {ArmorUpgradeType} type */
  upgrade(type) {}
}

export default Armor;