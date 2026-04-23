// ==================== src/dungeon/Condition.js ====================
import ConditionType from '../enums/ConditionType.js';

class Condition {
  constructor(type, value, extra = null) {
    this.type = type; // ConditionType
    this.value = value;
    this.extra = extra;
  }
}

export default Condition;