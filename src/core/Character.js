import { WeaponType } from '../enums/WeaponType.js';
import { Skill } from './Skill.js';
import { Backpack } from '../equipment/Backpack.js';
import { Unit } from '../battle/Unit.js';
import { BodyPart } from '../battle/BodyPart.js';
import AttributeType from '../enums/AttributeType.js';

export class Character extends Unit {
    constructor(id, name, strength, agility, constitution) {
        super(name, strength, agility, constitution);  // 调用父类构造
        this.id = id;
        this.name = name;
        this.strength = strength;
        this.agility = agility;
        this.constitution = constitution;
        this.maxHealth = constitution * 5;
        this.currentHealth = this.maxHealth;
        this.weapon = null;
        this.armors = {};                // slot -> Armor
        this.backpack = new Backpack();
        this.skills = new Map();          // WeaponType -> Skill
        this.statuses = [];
        this.floor = 1;
        this.currency = 0;
        this.battleSkillHits = new Map();
        this.adventureStartAttributes = { strength, agility, constitution };

         // 初始化全部位（PRD规定6部位：头/胸/左臂/右臂/左腿/右腿）
        this.bodyParts = [
            new BodyPart('头部', 0.3),
            new BodyPart('躯干', 0.4),
            new BodyPart('左臂', 0.1),
            new BodyPart('右臂', 0.1),
            new BodyPart('左腿', 0.05),
            new BodyPart('右腿', 0.05)
        ];
        this.bodyParts.forEach(p => p.init(this.maxHealth));

        // 初始化所有武器大类的技艺值
        Object.values(WeaponType).forEach(type => {
            this.skills.set(type, new Skill(0));
        });
    }

    equipWeapon(weapon) {
        if (this.weapon) this.backpack.addItem(this.weapon);
        this.weapon = weapon;
    }

    equipArmor(armor, slot) {
        if (this.armors[slot]) this.backpack.addItem(this.armors[slot]);
        this.armors[slot] = armor;
    }

    /** 覆写：根据当前武器返回对应技艺值 */
    getCurrentWeaponSkill() {
        const type = this.weapon?.type || WeaponType.UNARMED;
        const skill = this.skills.get(type);
        return skill ? skill.value : 0;
    }

    /**
     * 死亡：这里只做标记；永久成长与存档交给外部流程（main.js）驱动。
     */
    die() {
        this.isDown = true;
        this.currentHealth = 0;
    }

    /**
     * 按 PM“永久成长衰减曲线”计算本次可沉淀的成长。
     * 规则：对 (最终 - 开始) 的正增量分段，每 10 点一段，系数依次 0.5, 0.25, 0.125...
     * @returns {{strength:number, agility:number, constitution:number, weaponSkills: Record<string, number>}}
     */
    calculatePermanentGrowth() {
        const start = this.adventureStartAttributes || { strength: 0, agility: 0, constitution: 0 };
        const calc = (delta) => {
            let left = Math.max(0, Math.floor(delta));
            let coeff = 0.5;
            let total = 0;
            while (left > 0) {
                const seg = Math.min(10, left);
                total += seg * coeff;
                left -= seg;
                coeff *= 0.5;
            }
            return Math.max(0, Math.floor(total));
        };

        const growth = {
            strength: calc(this.strength - start.strength),
            agility: calc(this.agility - start.agility),
            constitution: calc(this.constitution - start.constitution),
            weaponSkills: {}
        };

        // 武器技艺：只对发生过命中记录的武器类型做沉淀（避免全系都刷）
        if (this.battleSkillHits && this.battleSkillHits.size > 0) {
            for (const [weaponType, hits] of this.battleSkillHits.entries()) {
                growth.weaponSkills[weaponType] = calc(hits);
            }
        }

        return growth;
    }

    increaseAttribute(attr, amount, weaponType = null) {
        if (attr === 'STRENGTH' || attr === AttributeType.STRENGTH) this.strength += amount;
        else if (attr === 'AGILITY' || attr === AttributeType.AGILITY) this.agility += amount;
        else if (attr === 'CONSTITUTION' || attr === AttributeType.CONSTITUTION) this.constitution += amount;
        else if ((attr === 'WEAPON_SKILL' || attr === AttributeType.WEAPON_SKILL) && weaponType) {
            const skill = this.skills.get(weaponType);
            if (skill) skill.value += amount;
        }
    }

    recordAdventureStartAttributes() {
        this.adventureStartAttributes = {
            strength: this.strength,
            agility: this.agility,
            constitution: this.constitution
        };
    }

    static createCharacter(name, strength, agility, constitution) {
        const id = Date.now() + '-' + Math.random().toString(36);
        return new Character(id, name, strength, agility, constitution);
    }
}