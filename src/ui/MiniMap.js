// ==================== src/ui/MiniMap.js ====================
import GridMap from '../battle/GridMap.js';
import Unit from '../battle/Unit.js';

class MiniMap {
  /** @param {GridMap} grid */
  constructor(grid) {
    this.grid = grid;
  }

  render() {}
  /** @param {Unit} u */
  centerOn(u) {}
}

export default MiniMap;