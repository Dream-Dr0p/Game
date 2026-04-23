// ==================== src/battle/SwitchWeaponAction.js ====================
import Action from './Action.js';
import Weapon from '../equipment/Weapon.js';

class SwitchWeaponAction extends Action {
  /** @param {Weapon} newWeapon */
  constructor(newWeapon) {
    super(30);
    this.newWeapon = newWeapon;
  }

  execute() {}
}

export default SwitchWeaponAction;