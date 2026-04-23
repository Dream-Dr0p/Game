// ==================== src/dungeon/Effect.js ====================
import EffectType from '../enums/EffectType.js';

class Effect {
  constructor(type, value, target) {
    this.type = type; // EffectType
    this.value = value;
    this.target = target;
  }
}

export default Effect;