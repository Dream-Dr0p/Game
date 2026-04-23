// ==================== src/dungeon/EventData.js ====================
import EventOption from './EventOption.js';

class EventData {
  constructor(title, description, options) {
    this.title = title;
    this.description = description;
    this.options = options; // EventOption[]
  }
}

export default EventData;