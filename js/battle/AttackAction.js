export class AttackAction {
    constructor(attacker, defender, targetPartSlot, battle) {
        this.attacker = attacker;
        this.defender = defender;
        this.targetPartSlot = targetPartSlot;
        this.battle = battle;
    }

    execute() {
        const attackerSkill = this.attacker.getCurrentWeaponSkill();
        const defenderSkill = this.defender.getCurrentWeaponSkill();
        // 完全miss判定
        const missChance = Math.max(0, 0.1 + (defenderSkill - attackerSkill) / 200);
        if(Math.random() < missChance) {
            this.battle.log(`${this.attacker.name} 攻击完全未命中！`);
            this.consumeAction();
            return;
        }

        let targetPart = this.defender.bodyParts.find(p => p.slot === this.targetPartSlot);
        if(!targetPart) targetPart = this.defender.bodyParts[0];
        // 部位命中判定 (技艺影响)
        const hitChance = 0.5 + attackerSkill / 300;
        if(Math.random() > hitChance) {
            // 随机部位
            const rand = Math.floor(Math.random() * this.defender.bodyParts.length);
            targetPart = this.defender.bodyParts[rand];
            this.battle.log(`未击中指定部位，击中${targetPart.slot}`);
        }

        // 伤害计算
        let baseDamage = (this.attacker.weapon?.attack || 8) + Math.floor(this.attacker.strength / 3);
        const penetPower = this.attacker.weapon?.penetrationPower || 0;
        const penetRate = this.attacker.weapon?.penetrationRate || 0.75;
        const { dmg, destroyed, covered } = targetPart.takeDamage(baseDamage, penetPower, penetRate, attackerSkill);
        this.defender.health -= dmg;
        this.battle.log(`${this.attacker.name} 对 ${this.defender.name} 的 ${targetPart.slot} 造成 ${dmg} 伤害${covered?' (格挡部位)':''}`);
        if(destroyed) this.battle.log(`部位 ${targetPart.slot} 被破坏!`);

        // 暴击判定
        const critRate = attackerSkill / (attackerSkill+100) * 0.3;
        if(Math.random() < critRate) {
            const multi = attackerSkill>50?1.5:1.2;
            const extra = Math.floor(dmg * (multi-1));
            this.defender.health -= extra;
            this.battle.log(`暴击！额外伤害 ${extra}`);
        }

        // 技艺熟练度增加 (简化)
        if(this.attacker.weapon) {
            let gain = 1.0;
            let skill = this.attacker.skills.get(this.attacker.weapon.type);
            if(skill) skill.addExperience(gain);
        }

        this.consumeAction();
    }

    consumeAction() {
        this.battle.actionBar.consume(this.attacker, 100);
        this.battle.actionBar.resetAfterTurn(this.attacker);
    }
}