// ==================== src/equipment/WeaponSpecialAbility.js ====================
// Interface (base class)
class WeaponSpecialAbility {
  /** @param {AttackContext} ctx */
  onAttack(ctx) {}

  /** @param {DefendContext} ctx */
  onDefend(ctx) {}
}

export default WeaponSpecialAbility;