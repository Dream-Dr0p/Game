// ==================== src/battle/DiscardItemAction.js ====================
import Action from './Action.js';

class DiscardItemAction extends Action {
  /** @param {Item} item */
  constructor(item) {
    super(20);
    this.item = item;
  }

  execute() {}
}

export default DiscardItemAction;