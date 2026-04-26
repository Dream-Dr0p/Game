import { GridMap } from './GridMap.js';
import {BodyPartSlot} from '../enums/BodyPartSlot.js'

const partNameMap = {
    [BodyPartSlot.HEAD]: '头部',
    [BodyPartSlot.CHEST]: '躯干',
    [BodyPartSlot.LEFT_ARM]: '左臂',
    [BodyPartSlot.RIGHT_ARM]: '右臂',
    [BodyPartSlot.LEFT_LEG]: '左腿',
    [BodyPartSlot.RIGHT_LEG]: '右腿'
};

export class Battle {
    constructor(player, enemies) {
        this.player = player;
        this.enemies = enemies;
        this.grid = new GridMap(11, 11);
        this.logs = [];
        this.ended = false;
        this.currentTurn = null;
        this.playerActionPoints = 0;
        this.enemyActionPoints = 0;
        this.initPositions();
        this.round = 1;
        this.currentEnemyIndex = 0;
    }

    initPositions() {
        this.grid.setUnit(this.player, 5, 8);
        for (let i = 0; i < this.enemies.length; i++) {
            let placed = false;
            while (!placed) {
                let x = 2 + Math.floor(Math.random() * 7);
                let y = 1 + Math.floor(Math.random() * 3);
                if (!this.grid.getUnitAt(x, y)) {
                    this.grid.setUnit(this.enemies[i], x, y);
                    placed = true;
                }
            }
        }
    }

    start() {
        this.log('战斗开始！');
        this.startPlayerTurn();
    }

    startPlayerTurn() {
        if (this.ended) return;
        this.currentTurn = 'player';
        this.playerActionPoints = 100;
        this.log(`=== 第 ${this.round   } 回合，玩家行动 ===`);
        window.dispatchEvent(new CustomEvent('playerTurn', { detail: { battle: this } }));
        window.dispatchEvent(new CustomEvent('battleUpdate'));
    }

    startEnemyTurn() {
        if (this.ended) return;
        this.currentTurn = 'enemy';
        this.currentEnemyIdx = 0;  // 新增成员变量
        // 重置所有活着的敌人的行动点
        for (let e of this.enemies) {
            if (e.isAlive()) e.actionPoints = 100;
        }
        this.log(`=== 敌人行动 ===`);
        window.dispatchEvent(new CustomEvent('battleUpdate'));
        this.processEnemyTurn();
    }

    processEnemyTurn() {
        if (this.ended || this.currentTurn !== 'enemy') return;

        // 实时获取活着的敌人列表（必须在任何使用前定义）
        const alive = this.enemies.filter(e => e.isAlive());
        if (alive.length === 0) {
            this.log(`敌人回合结束`);
            this.round++;
            this.startPlayerTurn();
            return;
        }
        // 确保索引有效
        if (this.currentEnemyIdx >= alive.length) {
            this.log(`敌人回合结束`);
            this.round++;
            this.startPlayerTurn();
            return;
        }
        const enemy = alive[this.currentEnemyIdx];
        let ap = enemy.actionPoints;
        const distance = this.grid.getDistance(enemy.pos, this.player.pos);
        const weaponRange = enemy.weapon ? enemy.weapon.range : 1;
        let actionTaken = false;
        const attackCost = this.getAttackCost(enemy);

        if (distance <= weaponRange && ap >= attackCost) {
            const randomPart = this.player.bodyParts[Math.floor(Math.random() * this.player.bodyParts.length)].slot;
            this.attackAction(enemy, this.player, randomPart);
            ap -= attackCost;
            actionTaken = true;
            this.log(`${enemy.name} 攻击，消耗 ${attackCost} 行动点，剩余 ${ap}`);
        } else if (ap >= 20) {
            const targetPos = this.grid.getCloserPosition(enemy.pos, this.player.pos, 1);
            if (targetPos.x !== enemy.pos.x || targetPos.y !== enemy.pos.y) {
                this.grid.setUnit(enemy, targetPos.x, targetPos.y);
                ap -= 20;
                this.log(`${enemy.name} 移动了 1 格，剩余行动点 ${ap}`);
                actionTaken = true;
                window.dispatchEvent(new CustomEvent('battleUpdate'));
            } else {
                ap = 0;
                actionTaken = true;
            }
        }

        if (!actionTaken) ap = 0;
        enemy.actionPoints = ap;
        window.dispatchEvent(new CustomEvent('battleUpdate'));

        if (enemy.actionPoints > 0) {
            // 同一敌人继续行动
            setTimeout(() => this.processEnemyTurn(), 200);
        } else {
            // 当前敌人行动完毕，移到下一个
            this.currentEnemyIdx++;
            setTimeout(() => this.processEnemyTurn(), 50);
        }
    }

    attackAction(attacker, defender, partSlot) {
        let aSkill = attacker.getCurrentWeaponSkill();
        let dSkill = defender.getCurrentWeaponSkill();
        if (Math.random() < 0.1 + (dSkill - aSkill) / 200) {
            this.log(`${attacker.name} 完全未命中！`);
            window.dispatchEvent(new CustomEvent('battleUpdate'));
            return;
        }
        let targetPart = defender.bodyParts.find(p => p.slot === partSlot);
        if (!targetPart) targetPart = defender.bodyParts[0];
        let hitChance = 0.5 + aSkill / 300;
        if (Math.random() > hitChance) {
            let rand = Math.floor(Math.random() * defender.bodyParts.length);
            targetPart = defender.bodyParts[rand];
            this.log(`未击中指定部位，击中${partNameMap[targetPart.slot] || targetPart.slot}`);
        }
        let baseDamage = (attacker.weapon?.attack || 8) + Math.floor(attacker.strength / 3);
        let penPow = attacker.weapon?.penetrationPower || 0;
        let penRate = attacker.weapon?.penetrationRate || 0.75;
        let { dmg, destroyed, covered } = targetPart.takeDamage(baseDamage, penPow, penRate);
        defender.health -= dmg;
        this.log(`${attacker.name} 使用 ${attacker.weapon?.name || '徒手'} 对 ${defender.name} 的 ${partNameMap[targetPart.slot] || targetPart.slot} 造成 ${dmg} 伤害...`);
        if (destroyed) this.log(`部位 ${partNameMap[targetPart.slot] || targetPart.slot} 被破坏!`);
        if (Math.random() < aSkill / (aSkill + 100) * 0.3) {
            let extra = Math.floor(dmg * 0.5);
            defender.health -= extra;
            this.log(`暴击！额外伤害 ${extra}`);
        }
        if (attacker.weapon) {
            let skill = attacker.skills.get(attacker.weapon.type);
            if (skill) skill.addExperience(1.0);
        }
        if (defender === this.player && !defender.isAlive()) {
            this.endBattle(false);
            return;
        }
        if (!defender.isAlive() && defender !== this.player) {
            const index = this.enemies.indexOf(defender);
            if (index !== -1) {
                this.log(`${defender.name} 被击败`);
            }
        }
        window.dispatchEvent(new CustomEvent('battleUpdate'));
        this.checkEnd();
    }

    playerAction(action) {
        if (this.ended || this.currentTurn !== 'player') return;
        if (action.type === 'attack') {
            const cost = this.getAttackCost(this.player.weapon);
            if (this.playerActionPoints >= cost) {
                this.attackAction(this.player, action.enemy, action.part);
                this.playerActionPoints -= cost;
                this.log(`攻击消耗 ${cost} 行动点，剩余 ${this.playerActionPoints}`);
            } else {
                this.log(`行动点不足，无法攻击`);
                return;
            }
        } else if (action.type === 'move') {
            const steps = action.steps || 1;
            const cost = steps * 20;
            if (this.playerActionPoints >= cost) {
                this.grid.setUnit(this.player, action.x, action.y);
                this.playerActionPoints -= cost;
                this.log(`${this.player.name} 移动了 ${steps} 格`);
                window.dispatchEvent(new CustomEvent('battleUpdate'));
            } else {
                this.log(`行动点不足，无法移动`);
                return;
            }
        } else if (action.type === 'defend') {
            this.player.defending = true;
            this.playerActionPoints = 0;   // 清零
            this.log(`${this.player.name} 防御姿态，结束回合`);
            // 回合结束逻辑复用等待的处理
            this.startEnemyTurn();
            return; // 避免后续 checkEnd 重复
        } else if (action.type === 'wait') {
            this.playerActionPoints = 0;
            this.log(`${this.player.name} 等待，结束回合`);
        } else if (action.type === 'escape') {
            this.endBattle(false);
            return;
        }
        
        if (this.playerActionPoints <= 0) {
            this.log(`玩家回合结束`);
            this.startEnemyTurn();
        } else {
            window.dispatchEvent(new CustomEvent('playerTurn', { detail: { battle: this } }));
        }
        this.checkEnd();
    }

    checkEnd() {
        if (!this.player.isAlive()) this.endBattle(false);
        else if (this.enemies.every(e => !e.isAlive())) this.endBattle(true);
    }

    endBattle(victory) {
        if (this.ended) return;
        this.ended = true;
        window.dispatchEvent(new CustomEvent('battleEnd', { detail: { victory, battle: this } }));
    }

    log(msg) {
        this.logs.unshift(msg);
        if (this.logs.length > 20) this.logs.pop();
        window.dispatchEvent(new CustomEvent('battleLog', { detail: msg }));
    }
	
	getAttackCost(unit) {
        const weapon = unit.weapon;
        if (!weapon) return 30; // 徒手
        let cost = 30 + weapon.weight * 5;
        return Math.min(80, Math.max(20, cost));
    }

    switchWeapon(newWeapon) {
        if (this.currentTurn !== 'player') return;
        const oldWeapon = this.player.weapon;
        // 将旧武器放回背包
        if (oldWeapon) {
            this.player.backpack.weapons.push(oldWeapon);
        }
        // 从背包中移除新武器
        const idx = this.player.backpack.weapons.findIndex(w => w.id === newWeapon.id);
        if (idx !== -1) this.player.backpack.weapons.splice(idx, 1);
        this.player.weapon = newWeapon;
        this.log(`${this.player.name} 更换武器为 ${newWeapon.name}`);
        window.dispatchEvent(new CustomEvent('battleUpdate'));
    }
}