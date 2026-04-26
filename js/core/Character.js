import { Unit } from '../battle/Unit.js';
import { Backpack } from '../equipment/Backpack.js';
import { Skill } from './Skill.js';
import { WeaponType } from '../enums/WeaponType.js';
import { FIST_WEAPON } from '../equipment/Weapon.js';

export class Character extends Unit {
    constructor(name) {
        super(name, 10, 10, 10);
        this.name = name;
        this.backpack = new Backpack();
        this.weapon = null;
        this.armors.clear();
        this.skills.set(WeaponType.UNARMED, new Skill(0));
        this.initBodyParts();
        this.recordAdventureStart();
        this.weapon = FIST_WEAPON.clone(); // 默认徒手，确保武器不为 null
    }

    equipWeapon(weapon) {
        if(this.weapon) this.backpack.weapons.push(this.weapon);
        this.weapon = weapon;
        // 从背包移除
        const idx = this.backpack.weapons.findIndex(w=>w.id===weapon.id);
        if(idx!==-1) this.backpack.weapons.splice(idx,1);
    }

    recordAdventureStart() {
        this.adventureStart = {
            strength: this.strength,
            agility: this.agility,
            constitution: this.constitution,
            skills: new Map(this.skills)
        };
    }

    die() {
        super.die();
        // 触发死亡UI
    }

    // 记录本次冒险开始时的属性快照
    recordAdventureStart() {
        this.adventureStart = {
            strength: this.strength,
            agility: this.agility,
            constitution: this.constitution,
            // 深拷贝技艺值
            skills: new Map(Array.from(this.skills.entries()).map(([k, v]) => [k, v.value]))
        };
    }

    // 计算永久成长（衰减曲线）
    calculatePermanentGrowth() {
        const diffStrength = this.strength - this.adventureStart.strength;
        const diffAgility = this.agility - this.adventureStart.agility;
        const diffConstitution = this.constitution - this.adventureStart.constitution;
        
        // 技艺差值：取所有技艺中提升最大的那种（或总和，这里简化为最大单项）
        let maxSkillDiff = 0;
        for (let [type, skill] of this.skills) {
            const startVal = this.adventureStart.skills.get(type) || 0;
            const diff = skill.value - startVal;
            if (diff > maxSkillDiff) maxSkillDiff = diff;
        }
        
        const applyDecay = (diff) => {
            if (diff <= 0) return 0;
            let remaining = diff;
            let gain = 0;
            let coeff = 0.5;
            while (remaining >= 10) {
                gain += Math.floor(10 * coeff);
                remaining -= 10;
                coeff /= 2;
            }
            if (remaining > 0) {
                gain += Math.floor(remaining * coeff);
            }
            return gain;
        };
        
        return {
            strength: applyDecay(diffStrength),
            agility: applyDecay(diffAgility),
            constitution: applyDecay(diffConstitution),
            skill: applyDecay(maxSkillDiff)
        };
    }

    getMoveRange() {
        let base = Math.max(1, Math.floor(this.agility / 5 + 0.5));
        // 武器+护甲+背包（已减免）
        let totalWeight = (this.weapon ? this.weapon.weight : 0);
        for (let armor of this.armors.values()) totalWeight += armor.weight;
        totalWeight += this.backpack.getTotalWeight();   // 背包已应用50%减免
        let penalty = Math.min(0.5, totalWeight / ((this.strength + this.constitution) || 1) * 0.1);
        let range = Math.max(1, Math.floor(base * (1 - penalty)));
        return range;
    }
}