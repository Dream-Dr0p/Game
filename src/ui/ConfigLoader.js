// ==================== src/ui/ConfigLoader.js ====================
import Weapon from '../equipment/Weapon.js';
import Armor from '../equipment/Armor.js';
import EnemyTemplate from '../battle/EnemyTemplate.js';
import EventData from '../dungeon/EventData.js';

class ConfigLoader {
  constructor() {
    this.weapons = [];
    this.armors = [];
    this.enemyTemplates = [];
    this.eventTemplates = [];
  }

  static getInstance() {}
  loadAll() {}
}

export default ConfigLoader;