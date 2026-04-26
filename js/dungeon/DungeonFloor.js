// js/dungeon/DungeonFloor.js
import { NodeType } from '../enums/NodeType.js';
import { enemyTemplates, Enemy } from '../battle/Enemy.js';
import { Battle } from '../battle/Battle.js';

export class Node {
    constructor(id, type, x, y) {
        this.id = id;
        this.type = type;
        this.x = x;
        this.y = y;
        this.neighbors = [];
        this.visited = false;
    }
}

export class DungeonFloor {
    constructor(floorNumber) {
        this.floorNumber = floorNumber;
        this.nodes = [];
        this.startNode = null;
        this.bossNode = null;
        this.currentNode = null;
        this.generateMap();
        // this.currentNode = this.startNode;
    }

    generateMap() {
        // 固定行布局（Y坐标从下到上）
        const rows = [
            { y: 420, cols: 1 },   // 起点
            { y: 340, cols: 3 },
            { y: 260, cols: 4 },
            { y: 180, cols: 3 },
            { y: 100, cols: 1 }    // Boss
        ];
        let id = 0;
        const allNodes = [];
        for (let r = 0; r < rows.length; r++) {
            const row = rows[r];
            const cols = row.cols;
            const startX = 800 / (cols + 1);
            for (let c = 0; c < cols; c++) {
                let type = NodeType.NORMAL_BATTLE;
                if (r === 0) type = NodeType.NORMAL_BATTLE;
                else if (r === rows.length - 1) type = NodeType.BOSS;
                else {
                    const rand = Math.random();
                    if (rand < 0.6) type = NodeType.NORMAL_BATTLE;
                    else if (rand < 0.75) type = NodeType.ELITE_BATTLE;
                    else if (rand < 0.85) type = NodeType.REST;
                    else if (rand < 0.93) type = NodeType.SHOP;
                    else type = NodeType.EVENT;
                }
                const x = (c + 1) * startX;
                const node = new Node(id++, type, x, row.y);
                allNodes.push(node);
                if (r === 0) this.startNode = node;
                if (r === rows.length - 1) this.bossNode = node;
            }
        }
        // 构建节点行分组
        const nodeRows = [];
        let idx = 0;
        for (let r = 0; r < rows.length; r++) {
            const rowNodes = [];
            for (let c = 0; c < rows[r].cols; c++) {
                rowNodes.push(allNodes[idx++]);
            }
            nodeRows.push(rowNodes);
        }
        // 连接相邻行
        for (let r = 0; r < nodeRows.length - 1; r++) {
            const currentRow = nodeRows[r];
            const nextRow = nodeRows[r + 1];
            for (let node of currentRow) {
                const colIndex = currentRow.indexOf(node);
                const step = Math.max(1, Math.floor(nextRow.length / currentRow.length));
                let startCol = Math.max(0, colIndex - step);
                let endCol = Math.min(nextRow.length - 1, colIndex + step);
                for (let i = startCol; i <= endCol; i++) {
                    if (!node.neighbors.includes(nextRow[i])) {
                        node.neighbors.push(nextRow[i]);
                    }
                }
                if (node.neighbors.length === 0 && nextRow.length) {
                    node.neighbors.push(nextRow[Math.floor(nextRow.length / 2)]);
                }
            }
        }
        this.nodes = allNodes;
    }

    canEnterNode(node) {
        if (node.visited) return false;
        if (node === this.startNode) return true;
        if (this.currentNode === null) {
            return node === this.startNode;
        }
        return this.currentNode.neighbors.includes(node);
    }

    enterNode(node, character, uiManager) {
        if (!this.canEnterNode(node)) {
            uiManager.showMessage("无法进入该节点（只能前进到相邻未访问节点）");
            return false;
        }
        node.visited = true;
        this.currentNode = node;
        if (node.type === NodeType.NORMAL_BATTLE || node.type === NodeType.ELITE_BATTLE || node.type === NodeType.BOSS) {
            const enemyCount = node.type === NodeType.BOSS ? 1 : (node.type === NodeType.ELITE_BATTLE ? 2 : 1 + Math.floor(Math.random() * 2));
            const enemies = [];
            for (let i = 0; i < enemyCount; i++) {
                const template = enemyTemplates[Math.floor(Math.random() * enemyTemplates.length)];
                enemies.push(new Enemy(template));
            }
            const battle = new Battle(character, enemies);
            uiManager.startBattle(battle);
        } else if (node.type === NodeType.REST) {
            character.health = Math.min(character.maxHealth, character.health + 15);
            uiManager.showMessage("休息恢复15生命");
            uiManager.refreshMap();
        } else if (node.type === NodeType.SHOP) {
            uiManager.showMessage("商店暂未实装");
            uiManager.refreshMap();
        } else if (node.type === NodeType.EVENT) {
            uiManager.showMessage("随机事件暂未实装");
            uiManager.refreshMap();
        }
        return true;
    }
}