// ==================== src/battle/UseItemAction.js ====================
import Action from './Action.js';
import Consumable from '../equipment/Consumable.js';

class UseItemAction extends Action {
  /** @param {Consumable} item */
  constructor(item) {
    super(100);
    this.item = item;
  }

  execute() {}
}

export default UseItemAction;