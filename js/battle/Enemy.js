// js/battle/Enemy.js
import { Unit } from './Unit.js';
import { Weapon, baseWeapons } from '../equipment/Weapon.js';
import { Skill } from '../core/Skill.js';
import { WeaponType } from '../enums/WeaponType.js';

export class Enemy extends Unit {
    constructor(template) {
        super(template.name, template.str, template.agi, template.con);
        this.weapon = template.weapon.clone();
        for (let armor of template.armors) {
            this.armors.set(armor.slot, armor.clone());
        }
        for (let [type, val] of Object.entries(template.skills)) {
            this.skills.set(type, new Skill(val));
        }
        this.initBodyParts();
        this.ai = new SimpleAI();
    }

    act(battle) {
        return this.ai.chooseAction(battle, this);
    }
}

class SimpleAI {
    chooseAction(battle, enemy) {
        const player = battle.player;
        const dist = battle.grid.getDistance(enemy.pos, player.pos);
        if (dist > enemy.weapon.range) {
            const target = battle.grid.getCloserPosition(enemy.pos, player.pos, enemy.getMoveRange());
            return { type: 'move', x: target.x, y: target.y };
        } else {
            const part = player.bodyParts[Math.floor(Math.random() * player.bodyParts.length)].slot;
            return { type: 'attack', target: player, part: part };
        }
    }
}

// 导出敌人模板，供地牢使用
export const enemyTemplates = [
    {
        name: '地精斥候', str: 8, agi: 12, con: 8,
        weapon: baseWeapons[1], // 匕首
        armors: [],
        skills: { [WeaponType.DAGGER]: 15 }
    },
    {
        name: '兽人战士', str: 15, agi: 8, con: 14,
        weapon: baseWeapons[3], // 手斧
        armors: [],
        skills: { [WeaponType.AXE]: 20 }
    }
];