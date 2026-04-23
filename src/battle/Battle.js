import { GridMap } from './GridMap.js';
import { ActionBar } from './ActionBar.js';
import { AttackAction, MoveAction, DefendAction, WaitAction } from './Action.js';

/**
 * 战斗主控制器，管理整个战斗流程（网格、行动条、回合执行）。
 */
export class Battle {
    /**
     * @param {Character} player 
     * @param {Enemy[]} enemies 
     */
    constructor(player, enemies) {
        this.player = player;
        this.enemies = enemies;
        this.grid = new GridMap(11, 11);  // 较小网格便于展示
        this.actionBar = new ActionBar(player, enemies);
        this.log = [];                   // 战斗日志
        this.totalRounds = 0;
        this.state = 'active';           // 'active', 'victory', 'defeat', 'escaped'
    }

    /** 初始化战斗场景：放置单位 */
    init() {
        // 玩家位于(5, 8) 中下方
        this.grid.placeUnit(this.player, 5, 8);
        // 敌人随机分布在上方（y < 5）
        this.enemies.forEach((enemy, i) => {
            let placed = false;
            for (let attempt = 0; attempt < 20; attempt++) {
                const x = Math.floor(Math.random() * 8) + 1;
                const y = Math.floor(Math.random() * 4);
                if (this.grid.placeUnit(enemy, x, y)) {
                    placed = true;
                    break;
                }
            }
            if (!placed) {
                // 强制放置
                this.grid.placeUnit(enemy, 2 + i * 2, 2);
            }
        });
        this.actionBar.init();
    }

    /** 处理玩家行动 */
    executePlayerAction(actionType, args) {
        const player = this.player;
        let action;
        switch (actionType) {
            case 'move':
                action = new MoveAction(player, args.pos);
                break;
            case 'attack':
                action = new AttackAction(player, args.target, args.partIndex);
                break;
            case 'defend':
                action = new DefendAction(player);
                break;
            case 'wait':
                action = new WaitAction(player);
                break;
            default:
                return '无效行动';
        }
        const result = action.execute(this);
        this.log.push(result);
        this.actionBar.consumeAction(player, action.actionPointCost);
        this.totalRounds++;
        this.checkVictory();
        return result;
    }

    /** 执行敌人AI行动 */
    executeEnemyAction(enemy) {
        const aiDecision = enemy.act(this);
        if (aiDecision.type === 'move') {
            const action = new MoveAction(enemy, aiDecision.pos);
            action.execute(this);
            this.actionBar.consumeAction(enemy, action.actionPointCost);
        } else if (aiDecision.type === 'attack') {
            const action = new AttackAction(enemy, aiDecision.target, aiDecision.partIndex);
            action.execute(this);
            this.actionBar.consumeAction(enemy, 100);
        } else {
            this.actionBar.consumeAction(enemy, 0);
        }
        this.totalRounds++;
        this.checkVictory();
    }

    /** 检查战斗结束条件 */
    checkVictory() {
        if (this.player.isDown) {
            this.state = 'defeat';
        } else if (this.enemies.every(e => e.isDown)) {
            this.state = 'victory';
        }
    }

    /** 主循环 tick（由外部 game loop 调用） */
    update() {
        if (this.state !== 'active') return;
        this.actionBar.tick();
        // 如果敌人可行动，自动执行
        const activeUnit = this.actionBar.getActiveUnit();
        if (activeUnit && activeUnit !== this.player) {
            this.executeEnemyAction(activeUnit);
        }
    }
}