import { Skill } from '../core/Skill.js';
import { BodyPart } from './BodyPart.js';
import { BODY_PARTS, BodyPartSlot } from '../enums/BodyPartSlot.js';

export class Unit {
    constructor(name, strength, agility, constitution) {
        this.name = name;
        this.strength = strength;
        this.agility = agility;
        this.constitution = constitution;
        this.maxHealth = constitution * 5;
        this.health = this.maxHealth;
        this.weapon = null;
        this.armors = new Map();
        this.skills = new Map(); // key: WeaponType
        this.bodyParts = [];
        this.statuses = [];
        this.tempSkillPenalty = 0;
        this.tempSpeedPenalty = 0;
    }

    initBodyParts() {
        const ratios = BodyPart.getBodyPartRatios();
        for(let slot of BODY_PARTS) {
            const part = new BodyPart(slot, ratios[slot], this);
            this.bodyParts.push(part);
        }
    }

    getSkillValue(type) {
        const skill = this.skills.get(type);
        return skill ? skill.value - (this.tempSkillPenalty||0) : 0;
    }

    getCurrentWeaponSkill() {
        if(!this.weapon) return this.getSkillValue('unarmed');
        return this.getSkillValue(this.weapon.type);
    }

    getSpeed() {
        let weightPenalty = 0;
        if(this.weapon) weightPenalty += this.weapon.weight;
        for(let armor of this.armors.values()) weightPenalty += armor.weight;
        let reduction = Math.min(0.5, weightPenalty / (this.strength + this.constitution) * 0.1);
        let spd = this.agility * (1 - this.tempSpeedPenalty) * (1 - reduction);
        return Math.max(10, spd);
    }

    getMoveRange() {
        // 基础移动格数 = 敏捷/5 向上取整，至少1格
        let base = Math.max(1, Math.floor(this.agility / 5 + 0.5));
        // 计算当前装备总重量（武器+护甲）
        let totalWeight = (this.weapon ? this.weapon.weight : 0);
        for (let armor of this.armors.values()) totalWeight += armor.weight;
        // 负重惩罚系数，最大50%
        let penalty = Math.min(0.5, totalWeight / ((this.strength + this.constitution) || 1) * 0.1);
        let range = Math.max(1, Math.floor(base * (1 - penalty)));
        return range;
    }

    die() {
        this.health = 0;
    }

    isAlive() {
        return this.health > 0;
    }
}