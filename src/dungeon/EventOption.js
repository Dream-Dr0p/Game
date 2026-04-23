// ==================== src/dungeon/EventOption.js ====================
import Condition from './Condition.js';
import Effect from './Effect.js';

class EventOption {
  constructor(text, condition, effects) {
    this.text = text;
    this.condition = condition; // Condition
    this.effects = effects; // Effect[]
  }
}

export default EventOption;