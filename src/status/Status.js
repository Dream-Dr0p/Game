// ==================== src/status/Status.js ====================
import StatusEffect from './StatusEffect.js';
import Unit from '../battle/Unit.js';

class Status {
  constructor(id, name, description, duration, effects) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.duration = duration;
    this.effects = effects; // StatusEffect[]
  }

  /** @param {Unit} u */
  onTurnStart(u) {}
  /** @param {Unit} u */
  onTurnEnd(u) {}
  /** @param {Unit} u @param {Damage} d */
  onDamageDealt(u, d) {}
}

export default Status;