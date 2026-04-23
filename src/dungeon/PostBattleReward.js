// ==================== src/dungeon/PostBattleReward.js ====================
import RewardType from '../enums/RewardType.js';
import AttributeType from '../enums/AttributeType.js';
import WeaponType from '../enums/WeaponType.js';
import WeaponUpgradeType from '../enums/WeaponUpgradeType.js';
import ArmorUpgradeType from '../enums/ArmorUpgradeType.js';
import Equipment from '../equipment/Weapon.js'; // base class

class PostBattleReward {
  constructor(type, attribute = null, weaponType = null, healAmount = 0, targetEquipment = null, weaponUpgrade = null, armorUpgrade = null) {
    this.type = type; // RewardType
    this.attribute = attribute; // AttributeType
    this.weaponType = weaponType; // WeaponType
    this.healAmount = healAmount;
    this.targetEquipment = targetEquipment;
    this.weaponUpgrade = weaponUpgrade; // WeaponUpgradeType
    this.armorUpgrade = armorUpgrade; // ArmorUpgradeType
  }
}

export default PostBattleReward;