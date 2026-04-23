// ==================== src/core/Skill.js ====================
class Skill {
  constructor() {
    this.value = 0;
    this.experience = 0;
  }

  /** @param {number} gain */
  addExperience(gain) {}

  /** @returns {number} */
  getHitBonus() {}

  /** @returns {number} */
  getWeakSpotBonus() {}

  /** @returns {number} */
  getCritRate() {}

  /** @returns {number} */
  getCritMultiplier() {}

  /** @returns {number} */
  getVitalDefenseBonus() {}
}

export default Skill;