// ==================== src/battle/GridMap.js ====================
class GridMap {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.units = new Map(); // key: "x,y", value: Unit
  }

  /** @param {Position} a @param {Position} b @returns {number} */
  getDistance(a, b) {}

  /** @param {Unit} u @param {Position} target @returns {boolean} */
  isValidMove(u, target) {}

  /** @param {Unit} u @param {Position} target */
  moveUnit(u, target) {}
}

export default GridMap;