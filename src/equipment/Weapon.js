// ==================== src/equipment/Weapon.js ====================
import WeaponType from '../enums/WeaponType.js';
import WeaponUpgradeType from '../enums/WeaponUpgradeType.js';

class Weapon {
  constructor(id, name, type, attack, penetrationPower, penetrationRate, range, weight, ability) {
    this.id = id;
    this.name = name;
    this.type = type; // WeaponType
    this.attack = attack;
    this.penetrationPower = penetrationPower;
    this.penetrationRate = penetrationRate;
    this.range = range;
    this.weight = weight;
    this.ability = ability; // WeaponSpecialAbility instance
    this.upgradeCount = 0;
  }

  /** @param {WeaponUpgradeType} type */
  upgrade(type) {}
}

export default Weapon;