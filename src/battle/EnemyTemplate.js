// ==================== src/battle/EnemyTemplate.js ====================
import Enemy from './Enemy.js';
import WeaponType from '../enums/WeaponType.js';

class EnemyTemplate {
  constructor(id, name, strength, agility, constitution, weaponId, armorIds, initialSkillValues, aiType) {
    this.id = id;
    this.name = name;
    this.strength = strength;
    this.agility = agility;
    this.constitution = constitution;
    this.weaponId = weaponId;
    this.armorIds = armorIds;
    this.initialSkillValues = initialSkillValues; // Map<WeaponType, int>
    this.aiType = aiType;
  }

  /** @returns {Enemy} */
  createEnemy() {}
}

export default EnemyTemplate;