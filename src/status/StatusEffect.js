// ==================== src/status/StatusEffect.js ====================
import EffectType from '../enums/EffectType.js';

class StatusEffect {
  constructor(type, value, isPercentage, targetTag) {
    this.type = type; // EffectType
    this.value = value;
    this.isPercentage = isPercentage;
    this.targetTag = targetTag;
  }
}

export default StatusEffect;