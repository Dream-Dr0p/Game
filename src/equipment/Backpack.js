// ==================== src/equipment/Backpack.js ====================
import Weapon from './Weapon.js';
import Armor from './Armor.js';
import Consumable from './Consumable.js';

class Backpack {
  constructor() {
    this.weapons = [];
    this.armors = [];
    this.consumables = [];
    this.baseReductionFactor = 0.5;
    this.upgradeLevel = 0;
  }

  /** @returns {number} */
  getWeightReduction() {}

  upgrade() {}

  /** @returns {number} */
  getTotalWeight() {}

  /** @param {Weapon|Armor|Consumable} item */
  addItem(item) {}

  /** @param {Weapon|Armor|Consumable} item */
  removeItem(item) {}
}

export default Backpack;