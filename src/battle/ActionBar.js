/**
 * 时间轴行动条，管理所有单位的行动进度。
 * 每 tick 根据单位速度增加进度，达到100%时该单位可行动。
 */
export class ActionBar {
    constructor(player, enemies) {
        this.player = player;
        this.enemies = enemies;
        this.activeUnit = null;      // 当前可行动的单位
    }

    /** 战斗开始时初始化行动条进度（随机偏移更有“先后手”感） */
    init() {
        const allUnits = [this.player, ...this.enemies];
        allUnits.forEach(u => {
            u.actionBarProgress = Math.random() * 40; // 0~40
        });
        this.activeUnit = null;
    }

    /** 每帧调用，增加所有单位进度 */
    tick() {
        const allUnits = [this.player, ...this.enemies];
        allUnits.forEach(u => {
            if (!u.isDown) {
                u.actionBarProgress += u.getSpeed() * 0.5; // 速度系数
            }
        });
        // 检查是否有单位可行动
        if (!this.activeUnit) {
            const candidates = allUnits.filter(u => u.actionBarProgress >= 100 && !u.isDown);
            if (candidates.length > 0) {
                candidates.sort((a, b) => b.actionBarProgress - a.actionBarProgress);
                this.activeUnit = candidates[0];
            }
        }
    }

    /** 消耗行动条并清空当前行动单位 */
    consumeAction(unit, cost) {
        unit.actionBarProgress -= cost;
        if (unit.actionBarProgress < 0) unit.actionBarProgress = 0;
        this.activeUnit = null;
    }

    /** 是否玩家回合 */
    isPlayerTurn() {
        return this.activeUnit === this.player;
    }

    /** 获取当前可行动单位 */
    getActiveUnit() {
        return this.activeUnit;
    }
}