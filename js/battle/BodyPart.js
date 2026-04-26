import { BodyPartSlot } from '../enums/BodyPartSlot.js';

export class BodyPart {
    constructor(slot, maxHpRatio, owner) {
        this.slot = slot;
        this.maxHealth = Math.floor(owner.maxHealth * maxHpRatio);
        this.currentHealth = this.maxHealth;
        this.owner = owner;
        this.armor = null;
        this.disabled = false;
    }

    takeDamage(damage, penetrationPower, penetrationRate, attackerSkill) {
        if(this.disabled) return { dmg:0, destroyed:false };
        let finalDamage = damage;
        let covered = false;
        if(this.armor && Math.random() < this.armor.coverage) {
            covered = true;
            let effectiveDef = Math.max(0, this.armor.defense - penetrationPower);
            if(penetrationPower >= this.armor.defense) {
                //完全穿透
            } else {
                finalDamage = Math.floor(damage * penetrationRate);
            }
        }
        this.currentHealth -= finalDamage;
        let destroyed = false;
        if(this.currentHealth <= 0) {
            this.disabled = true;
            destroyed = true;
            this.applyDisability();
        }
        return { dmg: finalDamage, destroyed, covered };
    }

    applyDisability() {
        const char = this.owner;
        if(this.slot === BodyPartSlot.HEAD) {
            char.die();
        } else if(this.slot === BodyPartSlot.LEFT_ARM || this.slot === BodyPartSlot.RIGHT_ARM) {
            // 降低技艺
            char.tempSkillPenalty = (char.tempSkillPenalty||0) + 10;
        } else if(this.slot === BodyPartSlot.LEFT_LEG || this.slot === BodyPartSlot.RIGHT_LEG) {
            char.tempSpeedPenalty = (char.tempSpeedPenalty||0) + 0.2;
        }
    }

    static getBodyPartRatios() {
        return {
            [BodyPartSlot.HEAD]: 0.15,
            [BodyPartSlot.CHEST]: 0.4,
            [BodyPartSlot.LEFT_ARM]: 0.1,
            [BodyPartSlot.RIGHT_ARM]: 0.1,
            [BodyPartSlot.LEFT_LEG]: 0.125,
            [BodyPartSlot.RIGHT_LEG]: 0.125
        };
    }
}