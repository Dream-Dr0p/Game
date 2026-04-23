// src/main.js
import Character from '#core/Character.js';
import Weapon from '#equipment/Weapon.js';
import Armor from '#equipment/Armor.js';
import Backpack from '#equipment/Backpack.js';
import Battle from '#battle/Battle.js';
import GridMap from '#battle/GridMap.js';
import Enemy from '#battle/Enemy.js';
import DungeonFloor from '#dungeon/DungeonFloor.js';
import BattleNode from '#dungeon/BattleNode.js';
// ... 其他导入

// ---------- 全局游戏状态 ----------
let currentCharacter = null;
let currentBattle = null;
let currentDungeonFloor = null;
let currentNode = null;

// DOM 元素
const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
const hpSpan = document.getElementById('hp');
const maxHpSpan = document.getElementById('maxHp');
const atkSpan = document.getElementById('atk');
const speedSpan = document.getElementById('speed');
const weightSpan = document.getElementById('weight');
const logDiv = document.getElementById('log');

function addLog(msg) {
    const p = document.createElement('div');
    p.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
    logDiv.appendChild(p);
    logDiv.scrollTop = logDiv.scrollHeight;
}

// ---------- 渲染模块 ----------
function drawGrid() {
    if (!currentBattle) return;
    const grid = currentBattle.grid;
    const cellW = canvas.width / grid.width;
    const cellH = canvas.height / grid.height;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // 画网格线
    ctx.strokeStyle = '#555';
    ctx.lineWidth = 1;
    for (let i = 0; i <= grid.width; i++) {
        ctx.beginPath();
        ctx.moveTo(i * cellW, 0);
        ctx.lineTo(i * cellW, canvas.height);
        ctx.stroke();
        ctx.moveTo(0, i * cellH);
        ctx.lineTo(canvas.width, i * cellH);
        ctx.stroke();
    }
    // 画单位
    for (const [posKey, unit] of grid.units.entries()) {
        const [x, y] = posKey.split(',').map(Number);
        ctx.fillStyle = unit instanceof Character ? '#3a86ff' : '#e63946';
        ctx.beginPath();
        ctx.arc(x * cellW + cellW/2, y * cellH + cellH/2, cellW*0.3, 0, 2*Math.PI);
        ctx.fill();
        ctx.fillStyle = 'white';
        ctx.font = `${cellW*0.2}px monospace`;
        ctx.fillText(unit.name || '?', x*cellW+cellW*0.2, y*cellH+cellH*0.7);
    }
}

// 射程指示器（鼠标悬停敌人时）
let currentHoverEnemy = null;
canvas.addEventListener('mousemove', (e) => {
    if (!currentBattle) return;
    const rect = canvas.getBoundingClientRect();
    const mx = (e.clientX - rect.left) * canvas.width / rect.width;
    const my = (e.clientY - rect.top) * canvas.height / rect.height;
    // 计算哪个格子有敌人
    // ... 命中检测 ...
    // 更新 currentHoverEnemy，触发重绘（高亮+射程圆环）
    drawGrid(); // 简化，实际应增量更新
});

// ---------- 战斗流程 ----------
async function startBattle(battleNode) {
    const enemies = battleNode.enemies;
    const grid = new GridMap(15, 15);
    // 放置玩家和敌人到初始位置（根据文档）
    // 玩家 (0,-3)
    // 敌人随机分布
    currentBattle = new Battle(currentCharacter, enemies, grid, new ActionBar());
    currentBattle.startBattle();
    addLog(`⚔️ 战斗开始！遭遇 ${enemies.length} 名敌人`);
    // 刷新UI
    updateStatsUI();
    drawGrid();
}

// 玩家选择攻击目标
async function playerAttack(enemy, part) {
    const action = new AttackAction(enemy, part, false);
    currentBattle.actionBar.consumeAction(currentCharacter, action);
    // 执行攻击逻辑（AttackAction 内部会调用伤害计算、部位破坏等）
    action.execute();
    // 检查胜利/死亡
    if (currentBattle.checkVictory()) {
        endBattle(true);
    }
    updateStatsUI();
    drawGrid();
}

function endBattle(victory) {
    if (victory) {
        addLog('🎉 战斗胜利！');
        // 显示奖励选择界面（弹出三个选项）
        showRewardSelection();
    } else {
        addLog('💀 角色死亡，开始永久成长结算');
        currentCharacter.die();
        // 跳转到死亡总结界面
    }
    currentBattle = null;
}

// ---------- UI 更新 ----------
function updateStatsUI() {
    if (!currentCharacter) return;
    hpSpan.textContent = currentCharacter.health;
    maxHpSpan.textContent = currentCharacter.maxHealth;
    const weaponAtk = currentCharacter.weapon?.attack || 8;
    atkSpan.textContent = weaponAtk + currentCharacter.strength;
    speedSpan.textContent = currentCharacter.getSpeed().toFixed(1);
    const weight = currentCharacter.backpack.getTotalWeight();
    weightSpan.textContent = Math.min(50, (weight / (currentCharacter.strength+currentCharacter.constitution)) * 10).toFixed(0);
}

// ---------- 初始化游戏 ----------
async function initGame() {
    // 创建角色（简易，实际需弹窗让用户选名字和初始装备）
    currentCharacter = new Character('player1', '勇者');
    currentCharacter.strength = 10;
    currentCharacter.agility = 10;
    currentCharacter.constitution = 10;
    currentCharacter.maxHealth = currentCharacter.constitution * 5;
    currentCharacter.health = currentCharacter.maxHealth;
    currentCharacter.backpack = new Backpack();
    // 从配置中选取基础武器/护甲
    const shortSword = new Weapon('sword1', '短剑', WeaponType.ONE_HANDED_SWORD, 12, 2, 0.6, 1, 2, null);
    const leatherArmor = new Armor('leather1', '皮甲', 3, 0.6, 3, BodyPartSlot.CHEST);
    currentCharacter.equipWeapon(shortSword);
    currentCharacter.equipArmor(leatherArmor, 1);
    // 记录冒险开始属性（用于死亡成长）
    currentCharacter.recordAdventureStartAttributes();

    // 生成第一层地牢（简易示例）
    const dummyEnemy = new Enemy('哥布林', 8, 8, new Map(), null, [], [], new AdvancedAI(0.7,0.3));
    const battleNode = new BattleNode('node1', NodeType.NORMAL_BATTLE, [], false, false, [dummyEnemy]);
    currentDungeonFloor = new DungeonFloor(1, [battleNode], battleNode, battleNode, []);
    currentNode = battleNode;
    
    await startBattle(battleNode);
}

// 启动游戏
initGame().catch(console.error);