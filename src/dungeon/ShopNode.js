// ==================== src/dungeon/ShopNode.js ====================
import Node from './Node.js';
import Item from '../equipment/Weapon.js'; // or generic

class ShopNode extends Node {
  constructor(id, type, neighbors, visited, isHidden, itemsForSale, rareItemsForSale) {
    super(id, type, neighbors, visited, isHidden);
    this.itemsForSale = itemsForSale;
    this.rareItemsForSale = rareItemsForSale;
  }

  /** @param {Item} item */
  buy(item) {}
}

export default ShopNode;