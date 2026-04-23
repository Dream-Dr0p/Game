// ==================== src/equipment/Consumable.js ====================
import StatusEffect from '../status/StatusEffect.js';

class Consumable {
  constructor(id, name, weight, effects) {
    this.id = id;
    this.name = name;
    this.weight = weight;
    this.effects = effects; // StatusEffect[]
  }

  /** @param {Character} target */
  use(target) {}
}

export default Consumable;