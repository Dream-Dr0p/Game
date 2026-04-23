// ==================== src/dungeon/EventNode.js ====================
import Node from './Node.js';
import EventData from './EventData.js';

class EventNode extends Node {
  constructor(id, type, neighbors, visited, isHidden, eventData) {
    super(id, type, neighbors, visited, isHidden);
    this.eventData = eventData;
  }

  trigger() {}
}

export default EventNode;