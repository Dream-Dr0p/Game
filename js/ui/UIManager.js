// js/ui/UIManager.js (完整版，默认点击移动/攻击，无需移动模式)
import { Character } from '../core/Character.js';
import { baseWeapons, Weapon } from '../equipment/Weapon.js';
import { baseArmors, Armor } from '../equipment/Armor.js';
import { DungeonFloor } from '../dungeon/DungeonFloor.js';
import { NodeType } from '../enums/NodeType.js';

export class UIManager {
    constructor() {
        this.currentScreen = 'main';
        this.currentCharacter = null;
        this.currentFloor = null;
        this.currentBattle = null;
        this.selectedNode = null;
        this.selectedEquipment = [];
        this.pendingBattle = null;
        this.battleCanvasClickHandler = null;
        this.initEventListeners();
        this.loadCharacters();
        console.log('UIManager 初始化完成');
    }

    refreshMap() {
        this.drawMap();
        this.updatePlayerHpDisplay();   // 刷新地图时同步更新血量显示
    }
    showMessage(msg) { alert(msg); }

    initEventListeners() {
        const btnNew = document.getElementById('btn-new-game');
        const btnLoad = document.getElementById('btn-load-game');
        if (btnNew) btnNew.onclick = () => this.showCreateScreen();
        if (btnLoad) btnLoad.onclick = () => this.showCharacterList();

        const confirmBtn = document.getElementById('confirm-creation');
        if (confirmBtn) confirmBtn.onclick = () => this.createCharacter();

        const btnBackpack = document.getElementById('btn-backpack');
        if (btnBackpack) btnBackpack.onclick = () => this.showBackpack();

        const btnAttack = document.getElementById('btn-attack');
        if (btnAttack) btnAttack.onclick = () => this.onAttackClick();
        const btnDefend = document.getElementById('btn-defend');
        if (btnDefend) btnDefend.onclick = () => this.onDefendClick();
        // 移动模式按钮 - 不再需要，可以隐藏或忽略
        const btnMove = document.getElementById('btn-move-mode');
        if (btnMove) btnMove.style.display = 'none';
        const btnWait = document.getElementById('btn-wait');
        if (btnWait) btnWait.onclick = () => this.onWaitClick();
        const btnEscape = document.getElementById('btn-escape');
        if (btnEscape) btnEscape.onclick = () => this.onEscapeClick();
        const btnSwitch = document.getElementById('btn-switch-weapon');
        if (btnSwitch) btnSwitch.onclick = () => this.switchWeapon();

        document.querySelectorAll('.close').forEach(el => {
            el.onclick = () => this.hideModals();
        });

        const deathOk = document.getElementById('death-ok');
        if (deathOk) deathOk.onclick = () => {
            document.getElementById('death-modal').classList.add('hidden');
            this.setActiveScreen('main-menu');
        };
        // 创建角色界面退出按钮
        const exitCreate = document.getElementById('exit-to-main-from-create');
        if (exitCreate) {
            exitCreate.onclick = () => {
                // 不保存，直接返回主菜单
                this.setActiveScreen('main-menu');
            };
        }

        // 地图界面退出按钮
        const exitMap = document.getElementById('exit-to-main-from-map');
        if (exitMap) {
            exitMap.onclick = () => {
                // 保存当前角色状态（血量、层数等）
                if (this.currentCharacter) {
                    // 更新存档中的当前血量、层数等信息
                    this.currentCharacter.floor = this.currentFloor ? this.currentFloor.floorNumber : 1;
                    this.saveCharacter(this.currentCharacter);
                    console.log('角色状态已保存，返回主菜单');
                }
                this.setActiveScreen('main-menu');
            };
        }
    }

    showCreateScreen() {
        console.log('切换到创建角色界面');
        this.setActiveScreen('create-screen');
        this.populateEquipmentLists();
    }

    populateEquipmentLists() {
    const weaponDiv = document.getElementById('weapon-list');
    const armorDiv = document.getElementById('armor-list');
    if (!weaponDiv || !armorDiv) return;
    
    // 清空
    weaponDiv.innerHTML = '';
    armorDiv.innerHTML = '';
    
    // 存储当前已选装备对象的引用
    this.selectedEquipment = [];   // 数组中每个元素 { item, type, domElement }
    
    // 创建武器列表
    baseWeapons.forEach(w => {
        const btn = document.createElement('div');
        btn.className = 'item-card';
        btn.innerText = `${w.name} (攻${w.attack} 重${w.weight} 长${w.range})`;
        btn.onclick = () => this.toggleEquipment(w, 'weapon', btn);
        weaponDiv.appendChild(btn);
    });
    
    // 创建护甲列表
    baseArmors.forEach(a => {
        const btn = document.createElement('div');
        btn.className = 'item-card';
        btn.innerText = `${a.name} (防${a.defense} 覆${a.coverage * 100}%)`;
        btn.onclick = () => this.toggleEquipment(a, 'armor', btn);
        armorDiv.appendChild(btn);
    });
    
    this.updateSelectedCount();
    }

    // selectEquipment(item, type) {
    //     if (this.selectedEquipment.length >= 2) return;
    //     this.selectedEquipment.push({ item, type });
    //     const countSpan = document.getElementById('selected-count');
    //     if (countSpan) countSpan.innerText = this.selectedEquipment.length;
    //     if (this.selectedEquipment.length === 2) {
    //         const confirmBtn = document.getElementById('confirm-creation');
    //         if (confirmBtn) confirmBtn.disabled = false;
    //     }
    // }

    toggleEquipment(item, type, domElement) {
        // 查找是否已经选中
        const index = this.selectedEquipment.findIndex(sel => sel.item === item);
        if (index !== -1) {
            // 已选中 -> 取消选中
            this.selectedEquipment.splice(index, 1);
            domElement.classList.remove('selected');
        } else {
            // 未选中 -> 若未满2件则添加，否则提示
            if (this.selectedEquipment.length >= 2) {
                this.showMessage("最多只能选择两件装备");
                return;
            }
            this.selectedEquipment.push({ item, type, domElement });
            domElement.classList.add('selected');
        }
        this.updateSelectedCount();
    }

    updateSelectedCount() {
        const countSpan = document.getElementById('selected-count');
        if (countSpan) countSpan.innerText = this.selectedEquipment.length;
        const confirmBtn = document.getElementById('confirm-creation');
        if (confirmBtn) confirmBtn.disabled = (this.selectedEquipment.length !== 2);
        // 更新已选摘要
        let summaryDiv = document.getElementById('selected-summary');
        if (!summaryDiv) {
            summaryDiv = document.createElement('div');
            summaryDiv.id = 'selected-summary';
            summaryDiv.style.marginTop = '12px';
            summaryDiv.style.fontSize = '12px';
            summaryDiv.style.color = '#ffd966';
            const parent = document.getElementById('confirm-creation').parentNode;
            parent.insertBefore(summaryDiv, document.getElementById('confirm-creation'));
        }
        if (this.selectedEquipment.length === 0) {
            summaryDiv.innerHTML = '未选择任何装备（至少选择一件武器或护甲）';
        } else {
            const names = this.selectedEquipment.map(sel => sel.item.name).join('、');
            summaryDiv.innerHTML = `已选择：${names}`;
        }
    }

    createCharacter() {
        const nameInput = document.getElementById('char-name');
        let name = nameInput ? nameInput.value.trim() : '勇者';
        if (!name) name = '勇者';
        const char = new Character(name);
        let firstWeapon = null; // 定义变量
        for (let sel of this.selectedEquipment) {
            if (sel.type === 'weapon') {
                const cloned = sel.item.clone();
                char.backpack.weapons.push(cloned);
                if (!firstWeapon) firstWeapon = cloned;
            } else if (sel.type === 'armor') {
                char.backpack.armors.push(sel.item.clone());
            }
        }
        if (firstWeapon) {
            char.equipWeapon(firstWeapon);
        } else {
            char.weapon = FIST_WEAPON.clone();
            console.log('未选择武器，使用徒手');
        }
        this.currentCharacter = char;
        this.saveCharacter(char);
        this.startDungeon();
        console.log(`角色 ${name} 创建完成，当前武器: ${char.weapon?.name || '徒手'}`);
    }

    startDungeon() {
        console.log('开始游戏，当前武器:', this.currentCharacter.weapon);
        const floorNum = this.currentCharacter.floor || 1;
        this.currentFloor = new DungeonFloor(1);
        this.currentCharacter.floor = 1;
        this.updateCharacterStatsPanel();
        this.updatePlayerHpDisplay();  
        this.setActiveScreen('map-screen');
        this.drawMap();
        this.updatePlayerHpDisplay();  // 确保地图界面显示正确的血量
    }

    drawMap() {
    const canvas = document.getElementById('map-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const nodes = this.currentFloor.nodes;
    if (!nodes.length) return;
    
    // 计算节点位置（使用 DungeonFloor 中的位置，若没有则计算）
    if (!nodes[0].x) {
        this.currentFloor.calculateNodePositions(canvas.width, canvas.height);
    }
    
    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#1a1c2a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 绘制连线
    ctx.beginPath();
    ctx.strokeStyle = '#888';
    ctx.lineWidth = 2;
    for (let node of nodes) {
        for (let nb of node.neighbors) {
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(nb.x, nb.y);
            ctx.stroke();
        }
    }
    
    // 绘制所有节点（先普通绘制，再单独绘制悬停的节点以实现放大）
    const hoverNode = this._hoverNode;  // 需要在 mousemove 中设置
    for (let node of nodes) {
        this._drawNode(ctx, node, node === hoverNode);
    }
    
    // 鼠标移动检测悬停
    const onMouseMove = (e) => {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const mx = (e.clientX - rect.left) * scaleX;
        const my = (e.clientY - rect.top) * scaleX;
        let hovered = null;
        for (let node of nodes) {
            const radius = 25;
            if (Math.hypot(mx - node.x, my - node.y) < radius) {
                hovered = node;
                break;
            }
        }
        if (this._hoverNode !== hovered) {
            this._hoverNode = hovered;
            this.drawMap();  // 重绘
        }
    };
    
    // 鼠标点击进入节点
    const onClick = (e) => {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const mx = (e.clientX - rect.left) * scaleX;
        const my = (e.clientY - rect.top) * scaleX;
        for (let node of nodes) {
            const radius = 25;
            if (Math.hypot(mx - node.x, my - node.y) < radius) {
                this.enterNodeDirectly(node);
                break;
            }
        }
    };
    
    canvas.removeEventListener('mousemove', this._mapMouseMoveHandler);
    canvas.removeEventListener('click', this._mapClickHandler);
    this._mapMouseMoveHandler = onMouseMove;
    this._mapClickHandler = onClick;
    canvas.addEventListener('mousemove', this._mapMouseMoveHandler);
    canvas.addEventListener('click', this._mapClickHandler);
    }

_drawNode(ctx, node, isHovered) {
    const isVisited = node.visited;
    const isCurrent = (this.currentFloor.currentNode === node);
    const isReachable = this.currentFloor.canEnterNode(node);
    
    let shape = 'circle';
    let size = isHovered ? 28 : 22;
    let color = '#3a6ea5';
    let borderColor = '#fff';
    let borderWidth = 2;
    
    // 节点类型样式
    switch (node.type) {
        case NodeType.BOSS:
            shape = 'diamond';
            size = isHovered ? 32 : 26;
            color = '#e63946';
            break;
        case NodeType.ELITE_BATTLE:
            shape = 'diamond';
            size = isHovered ? 30 : 24;
            color = '#b5651e';
            break;
        case NodeType.REST:
            shape = 'rect';
            size = isHovered ? 28 : 22;
            color = '#2a9d8f';
            break;
        case NodeType.SHOP:
            shape = 'rect';
            size = isHovered ? 28 : 22;
            color = '#e9c46a';
            break;
        case NodeType.EVENT:
            shape = 'triangle';
            size = isHovered ? 28 : 22;
            color = '#9c27b0';
            break;
        default:
            shape = 'circle';
    }
    
    // 状态覆盖
    if (isVisited && !isCurrent) {
        color = '#6c5b7b';
        borderColor = '#444';
        borderWidth = 1;
    }
    if (isCurrent) {
        color = '#ffd966';
        borderColor = 'gold';
        borderWidth = 4;
        size = isHovered ? size + 4 : size + 2;
    }
    if (isReachable && !isVisited && !isCurrent && !isHovered) {
        borderColor = 'lime';
        borderWidth = 3;
    }
    
    // 绘制阴影（浮动效果）
    if (isHovered) {
        ctx.shadowBlur = 15;
        ctx.shadowColor = 'rgba(255,255,0,0.8)';
    } else if (node.type === NodeType.BOSS && !isVisited) {
        ctx.shadowBlur = 10;
        ctx.shadowColor = 'rgba(230,57,70,0.6)';
    } else {
        ctx.shadowBlur = 0;
    }
    
    ctx.fillStyle = color;
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = borderWidth;
    ctx.beginPath();
    const x = node.x;
    const y = node.y;
    switch (shape) {
        case 'circle':
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            break;
        case 'rect':
            ctx.fillRect(x - size, y - size, size * 2, size * 2);
            ctx.strokeRect(x - size, y - size, size * 2, size * 2);
            break;
        case 'diamond':
            ctx.moveTo(x, y - size);
            ctx.lineTo(x + size, y);
            ctx.lineTo(x, y + size);
            ctx.lineTo(x - size, y);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            break;
        case 'triangle':
            ctx.moveTo(x, y - size);
            ctx.lineTo(x + size, y + size);
            ctx.lineTo(x - size, y + size);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            break;
    }
    ctx.shadowBlur = 0;
    
    // 绘制表情符号（而非文字）
    ctx.fillStyle = 'white';
    ctx.font = `${Math.max(16, size - 4)}px "Segoe UI Emoji", "Apple Color Emoji", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    let emoji = '';
    switch (node.type) {
        case NodeType.BOSS: emoji = '👑'; break;
        case NodeType.ELITE_BATTLE: emoji = '💀'; break;
        case NodeType.REST: emoji = '🛌'; break;
        case NodeType.SHOP: emoji = '💰'; break;
        case NodeType.EVENT: emoji = '❓'; break;
        default: emoji = '⚔️';
    }
    ctx.fillText(emoji, x, y);
    
    // 已访问标记（小对勾）
    if (isVisited && !isCurrent) {
        ctx.fillStyle = '#ccc';
        ctx.font = '14px monospace';
        ctx.fillText('✓', x + 12, y - 12);
    }
}

enterNodeDirectly(node) {
    if (!this.currentFloor.canEnterNode(node)) {
        this.showMessage("无法进入该节点（只能前进到相邻节点）");
        return;
    }
    this.currentFloor.enterNode(node, this.currentCharacter, this);
    // enterNode 内部会触发战斗或事件，其中会调用 startBattle 或 refreshMap
    // 注意不要重复刷新
}

    enterSelectedNode() {
        if (this.selectedNode && this.currentFloor.canEnterNode(this.selectedNode)) {
            this.currentFloor.enterNode(this.selectedNode, this.currentCharacter, this);
            this.drawMap();  // 重绘地图
        } else {
            this.showMessage('无法进入该节点（只能前进到相邻未访问节点）');
        }
    }

    startBattle(battle) {
        this.currentBattle = battle;
        this.setActiveScreen('battle-screen');
        // 清空之前的战斗日志
        const logContainer = document.getElementById('battle-log');
        if (logContainer) logContainer.innerHTML = '';
        setTimeout(() => this.renderBattleUI(), 10);

        // 绑定画布点击（只一次）
        const canvas = document.getElementById('battle-canvas');
        if (!this.battleCanvasClickHandler) {
            this.battleCanvasClickHandler = (e) => this.onBattleCanvasClick(e);
            canvas.addEventListener('click', this.battleCanvasClickHandler);
        }
       
        // 玩家回合事件
        const onPlayerTurn = (e) => { 
            if (e.detail.battle === battle) {
                this.pendingBattle = battle;   // 关键：设置 pendingBattle
                console.log('玩家回合，pendingBattle已设置');
            }
        };
        const onBattleEnd = (e) => {
            if (e.detail.victory) this.showReward();
            else this.characterDeath();
             window.removeEventListener('playerTurn', onPlayerTurn);
            window.removeEventListener('battleUpdate', onBattleUpdate);
            window.removeEventListener('battleEnd', onBattleEnd);
            window.removeEventListener('battleLog', onBattleLog);
            this.pendingBattle = null;
        };
        const onBattleUpdate = () => { 
            if (this.currentBattle === battle) {
                this.renderBattleUI(); 
                this.updateBattleInfoPanel();   // 更新信息栏
            }
        };
        const onBattleLog = (e) => {
            const logDiv = document.getElementById('battle-log');
            if (logDiv) {
                const p = document.createElement('div');
                p.innerText = e.detail;
                logDiv.prepend(p);
            }
        };

        window.addEventListener('playerTurn', onPlayerTurn);
        window.addEventListener('battleEnd', onBattleEnd);
        window.addEventListener('battleUpdate', onBattleUpdate);
        window.addEventListener('battleLog', onBattleLog);
        battle.start();
    }

    renderBattleUI() {
        const canvas = document.getElementById('battle-canvas');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const battle = this.currentBattle;
        if (!battle || !battle.grid) return;
        const grid = battle.grid;
        const cellW = canvas.width / grid.width;
        const cellH = canvas.height / grid.height;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let x = 0; x < grid.width; x++) {
            for (let y = 0; y < grid.height; y++) {
                ctx.fillStyle = (x + y) % 2 === 0 ? '#2c2f3a' : '#3a3e50';
                ctx.fillRect(x * cellW, y * cellH, cellW - 1, cellH - 1);
            }
        }
        for (let [key, unit] of grid.units.entries()) {
            const cx = unit.pos.x * cellW + cellW / 2;
            const cy = unit.pos.y * cellH + cellH / 2;
            const radius = Math.min(cellW, cellH) / 3;
            ctx.fillStyle = unit === battle.player ? '#4c9aff' : '#e63946';
            ctx.beginPath();
            ctx.arc(cx, cy, radius, 0, Math.PI * 2);
            ctx.fill();
            const barWidth = cellW * 0.8;
            const barHeight = 6;
            const barX = cx - barWidth / 2;
            const barY = cy - radius - 8;
            ctx.fillStyle = '#222';
            ctx.fillRect(barX, barY, barWidth, barHeight);
            const hpPercent = unit.health / unit.maxHealth;
            const hpWidth = barWidth * Math.max(0, hpPercent);
            ctx.fillStyle = '#4caf50';
            ctx.fillRect(barX, barY, hpWidth, barHeight);
            ctx.fillStyle = 'white';
            ctx.font = '10px monospace';
            ctx.fillText(`${unit.health}/${unit.maxHealth}`, barX, barY - 2);
        }
        this.updatePlayerHpDisplay();
    }

    updatePlayerHpDisplay() {
        if (this.currentCharacter) {
            const hpSpan = document.getElementById('player-hp');
            if (hpSpan) hpSpan.innerText = `${this.currentCharacter.health}/${this.currentCharacter.maxHealth}`;
        }
    }   

    enablePlayerActions() {
        this.pendingBattle = this.currentBattle;
        const canvas = document.getElementById('battle-canvas');
        if (!canvas) return;
        if (this.battleCanvasClickHandler) {
            canvas.removeEventListener('click', this.battleCanvasClickHandler);
        }
        this.battleCanvasClickHandler = (e) => this.onBattleCanvasClick(e);
        canvas.addEventListener('click', this.battleCanvasClickHandler);
    }

    onBattleCanvasClick(e) {
        console.log('画布点击，pendingBattle:', this.pendingBattle);
        if (!this.pendingBattle) {
            console.warn('pendingBattle 为空，无法操作');
            return;
        }
        const battle = this.pendingBattle;
        if (battle.currentTurn !== 'player') {
            this.showMessage('现在不是你的回合');
            return;
        }
        const canvas = document.getElementById('battle-canvas');
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const mx = (e.clientX - rect.left) * scaleX;
        const my = (e.clientY - rect.top) * scaleY;
        const grid = battle.grid;
        const cellW = canvas.width / grid.width;
        const cellH = canvas.height / grid.height;
        const gx = Math.floor(mx / cellW);
        const gy = Math.floor(my / cellH);
        const clickedUnit = grid.getUnitAt(gx, gy);
        
        if (clickedUnit && clickedUnit !== battle.player) {
            // 攻击敌人
            const distance = grid.getDistance(battle.player.pos, clickedUnit.pos);
            const range = battle.player.weapon ? battle.player.weapon.range : 1;
            if (distance <= range) {
                this.attackEnemy(clickedUnit);
            } else {
                this.showMessage(`距离不足！当前距离 ${distance}，需要 ≤ ${range}`);
            }
            return;
        }
        
        // 移动
        if (!clickedUnit || clickedUnit === battle.player) {
            const startPos = battle.player.pos;
            const steps = Math.abs(gx - startPos.x) + Math.abs(gy - startPos.y);
            const currentAP = battle.playerActionPoints;
            const maxStepsByAction = Math.floor(currentAP / 20);  // 剩余步数
            if (steps <= maxStepsByAction && steps > 0) {
                battle.playerAction({ type: 'move', x: gx, y: gy, steps: steps });
            } else {
                let reason = "";
                if (steps <= 0) reason = "请点击不同格子";
                else if (steps > maxStepsByAction) reason = `行动点不足，最多移动${maxStepsByAction}步`;
                else reason = "无效移动";
                this.showMessage(`无法移动：${reason}`);
            }
            return;
        }
    }

    attackEnemy(enemy) {
        const battle = this.pendingBattle;
        if (!battle) return;
        // 再次检查距离
        const distance = battle.grid.getDistance(battle.player.pos, enemy.pos);
        const range = battle.player.weapon ? battle.player.weapon.range : 1;
        if (distance > range) {
            this.showMessage(`距离不足，无法攻击！`);
            return;
        }
        const cost = battle.getAttackCost(battle.player.weapon);
        if (battle.playerActionPoints < cost) {
            this.showMessage("行动点不足，需要 ${cost} 点");
            return;
        }
        const partDiv = document.getElementById('body-part-select');
        const partBtns = partDiv.querySelector('.part-buttons');
        partBtns.innerHTML = '';
        enemy.bodyParts.forEach(part => {
            const btn = document.createElement('button');
            btn.innerText = part.slot;
            btn.onclick = () => {
                battle.playerAction({ type: 'attack', enemy: enemy, part: part.slot });
                partDiv.classList.add('hidden');
                // 不清除 pendingBattle
            };
            partBtns.appendChild(btn);
        });
        partDiv.classList.remove('hidden');
    }

    clearBattleCanvasListener() {
        const canvas = document.getElementById('battle-canvas');
        if (canvas && this.battleCanvasClickHandler) {
            canvas.removeEventListener('click', this.battleCanvasClickHandler);
            this.battleCanvasClickHandler = null;
        }
    }

    showEnemySelection(enemies) {
        // 移除已存在的选择面板
        const existingPanel = document.getElementById('enemy-select-panel');
        if (existingPanel) existingPanel.remove();
        
        const panel = document.createElement('div');
        panel.id = 'enemy-select-panel';
        panel.style.position = 'fixed';
        panel.style.backgroundColor = '#1e1f2c';
        panel.style.border = '2px solid #ffd966';
        panel.style.borderRadius = '16px';
        panel.style.padding = '16px';
        panel.style.zIndex = '300';
        panel.style.top = '40%';
        panel.style.left = '40%';
        panel.style.transform = 'translate(-50%, -50%)';
        panel.style.minWidth = '200px';
        panel.style.textAlign = 'center';
        panel.innerHTML = '<h4 style="margin:0 0 12px 0">⚔️ 选择攻击目标 ⚔️</h4>';
        
        enemies.forEach(enemy => {
            const btn = document.createElement('button');
            btn.innerText = `${enemy.name} ❤️ ${enemy.health}/${enemy.maxHealth}`;
            btn.style.display = 'block';
            btn.style.margin = '8px auto';
            btn.style.width = '80%';
            btn.onclick = () => {
                panel.remove();
                this.attackEnemy(enemy);
            };
            panel.appendChild(btn);
        });
        
        const cancelBtn = document.createElement('button');
        cancelBtn.innerText = '取消';
        cancelBtn.style.marginTop = '12px';
        cancelBtn.onclick = () => panel.remove();
        panel.appendChild(cancelBtn);
        
        document.body.appendChild(panel);
    }

    onAttackClick() {
        if (!this.pendingBattle) return;
        if (this.pendingBattle.currentTurn !== 'player') {
            this.showMessage('现在不是你的回合');
            return;
        }
        const enemies = this.pendingBattle.enemies.filter(e => e.isAlive());
        if (enemies.length === 0) return;
        this.attackEnemy(enemies[0]);
    }

    onDefendClick() {
        if (this.pendingBattle) this.pendingBattle.playerAction({ type: 'defend' });
    }

    onWaitClick() {
        if (this.pendingBattle) this.pendingBattle.playerAction({ type: 'wait' });
    }
    
    onEscapeClick() {
        if (this.pendingBattle) this.pendingBattle.playerAction({ type: 'escape' });
    }

    switchWeapon() {
        if (this.currentCharacter && this.currentCharacter.backpack.weapons.length > 0 && this.currentCharacter.backpack.weapons[0] !== this.currentCharacter.weapon) {
            this.currentCharacter.equipWeapon(this.currentCharacter.backpack.weapons[0]);
            alert(`装备 ${this.currentCharacter.weapon.name}`);
        } else {
            alert('没有可切换的武器');
        }
    }

    showBackpack() {
        const modal = document.getElementById('backpack-modal');
        const container = document.getElementById('backpack-items');
        if (!modal || !container) return;
        container.innerHTML = '';
        for (let w of this.currentCharacter.backpack.weapons) {
            const div = document.createElement('div');
            div.className = 'backpack-item';
            div.innerHTML = `${w.name} 攻${w.attack} 重${w.weight} <button class="equip-btn">装备</button>`;
            div.querySelector('.equip-btn').onclick = () => {
                this.currentCharacter.equipWeapon(w);
                this.showBackpack();
            };
            container.appendChild(div);
        }
        const weightSpan = document.getElementById('backpack-weight');
        if (weightSpan) weightSpan.innerText = this.currentCharacter.backpack.getTotalWeight().toFixed(1);
        modal.classList.remove('hidden');
    }

    showReward() {
        const modal = document.getElementById('reward-modal');
        const optionsDiv = document.getElementById('reward-options');
        if (!modal || !optionsDiv) return;
        optionsDiv.innerHTML = '';
        const rewards = ['属性+1 (力量)', '恢复30%生命', '武器攻击+2'];
        rewards.forEach(r => {
            const btn = document.createElement('button');
            btn.innerText = r;
            btn.onclick = () => {
                if (r.includes('力量')) this.currentCharacter.strength++;
                if (r.includes('恢复')) {
                    this.currentCharacter.health = Math.min(this.currentCharacter.maxHealth, this.currentCharacter.health + Math.floor(this.currentCharacter.maxHealth * 0.3));
                }
                if (r.includes('武器攻击') && this.currentCharacter.weapon) this.currentCharacter.weapon.attack += 2;
                modal.classList.add('hidden');
                this.drawMap();
                this.setActiveScreen('map-screen');
            };
            optionsDiv.appendChild(btn);
        });
        modal.classList.remove('hidden');
    }

    characterDeath() {
        // 1. 计算永久成长
        const growth = this.currentCharacter.calculatePermanentGrowth();
        
        // 2. 应用永久属性提升
        this.currentCharacter.strength += growth.strength;
        this.currentCharacter.agility += growth.agility;
        this.currentCharacter.constitution += growth.constitution;
        if (growth.skill > 0 && this.currentCharacter.weapon) {
            const skill = this.currentCharacter.skills.get(this.currentCharacter.weapon.type);
            if (skill) skill.addExperience(growth.skill);
        }
        
        // 3. 重置生命值至上限
        this.currentCharacter.health = this.currentCharacter.maxHealth;
        
        // 4. 保存更新后的角色
        this.saveCharacter(this.currentCharacter);
        
        // 5. 显示死亡总结
        const statsDiv = document.getElementById('death-stats');
        if (statsDiv) {
            statsDiv.innerHTML = `本次冒险提升:<br>
            💪 力量 +${growth.strength}<br>
            🏃 敏捷 +${growth.agility}<br>
            🛡️ 体质 +${growth.constitution}<br>
            ⚔️ 技艺 +${growth.skill}`;
        }
        document.getElementById('death-modal').classList.remove('hidden');
    }

    setActiveScreen(screenId) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        const target = document.getElementById(screenId);
        if (target) target.classList.add('active');
        else console.error(`未找到屏幕: ${screenId}`);
    }

    saveCharacter(char) {
        const weaponData = char.weapon ? {
            id: char.weapon.id,
            name: char.weapon.name,
            type: char.weapon.type,
            attack: char.weapon.attack,
            penetrationPower: char.weapon.penetrationPower,
            penetrationRate: char.weapon.penetrationRate,
            range: char.weapon.range,
            weight: char.weapon.weight,
            upgradeCount: char.weapon.upgradeCount
        } : null;
        
        const data = {
            name: char.name,
            strength: char.strength,
            agility: char.agility,
            constitution: char.constitution,
            health: char.health,
            maxHealth: char.maxHealth,
            floor: char.floor || 1,
            weapon: weaponData,   // 保存完整武器对象
            // 可选的背包简化保存（后续可扩展）
        };
        localStorage.setItem(`char_${char.name}`, JSON.stringify(data));
    }

    loadCharacters() {
        const container = document.getElementById('character-list');
        if (!container) return;
        container.innerHTML = '';
        let hasAny = false;
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('char_')) {
                hasAny = true;
                const data = JSON.parse(localStorage.getItem(key));
                const card = document.createElement('div');
                card.className = 'character-card';
                
                // 构建详细信息HTML
                const infoHTML = `
                    <div style="font-weight:bold;">${data.name}</div>
                    <div style="font-size:12px;">❤️ ${data.health}/${data.maxHealth} | ⚔️ ${data.weaponName || '徒手'}</div>
                    <div style="font-size:10px;">💪 ${data.strength} | 🏃 ${data.agility} | 🛡️ ${data.constitution}</div>
                `;
                const infoDiv = document.createElement('div');
                infoDiv.innerHTML = infoHTML;
                infoDiv.style.cursor = 'pointer';
                infoDiv.style.flex = '1';
                
                // 删除按钮
                const delBtn = document.createElement('button');
                delBtn.innerText = '❌';
                delBtn.style.marginLeft = '8px';
                delBtn.style.background = '#5a2a2a';
                delBtn.style.padding = '2px 6px';
                delBtn.style.fontSize = '12px';
                delBtn.onclick = (e) => {
                    e.stopPropagation();
                    if (confirm(`确定要删除角色“${data.name}”吗？`)) {
                        this.deleteCharacter(key);
                    }
                };
                
                card.appendChild(infoDiv);
                card.appendChild(delBtn);
                
                // 点击加载角色
                card.onclick = (e) => {
                    if (e.target !== delBtn) {
                        this.loadCharacterFromData(data);
                    }
                };
                container.appendChild(card);
            }
        }
        if (!hasAny) {
            container.innerHTML = '<div style="text-align:center; padding:20px;">暂无角色，请先创建</div>';
        }
    }

    loadCharacterFromData(data) {
        const char = new Character(data.name);
        char.strength = data.strength;
        char.agility = data.agility;
        char.constitution = data.constitution;
        char.health = data.health;
        char.maxHealth = data.maxHealth;
        char.floor = data.floor || 1;
        
        // 恢复武器
        if (data.weapon) {
            // 根据保存的数据重新创建武器实例
            const restoredWeapon = new Weapon(data.weapon);
            char.weapon = restoredWeapon;
            // 可选：也把武器放入背包（避免丢失）
            if (!char.backpack.weapons.find(w => w.id === restoredWeapon.id)) {
                char.backpack.weapons.push(restoredWeapon);
            }
        } else {
            // 没有武器数据，给徒手
            char.weapon = FIST_WEAPON.clone();
        }
        
        this.currentCharacter = char;
        this.startDungeon();
    }

    deleteCharacter(key) {
        if (this.currentCharacter) {
            const savedData = JSON.parse(localStorage.getItem(key));
            if (savedData && savedData.name === this.currentCharacter.name) {
                this.currentCharacter = null;
                this.setActiveScreen('main-menu');
            }
        }
        localStorage.removeItem(key);
        this.loadCharacters();
    }

    showCharacterList() {
        this.loadCharacters();
        const listDiv = document.getElementById('character-list');
        if (listDiv) listDiv.classList.remove('hidden');
    }

    hideModals() {
        document.querySelectorAll('.modal').forEach(m => m.classList.add('hidden'));
        const partDiv = document.getElementById('body-part-select');
        if (partDiv) partDiv.classList.add('hidden');
    }

    updateCharacterStatsPanel() {
        let panel = document.getElementById('char-stats-panel');
        if (!panel) {
            const mapContainer = document.getElementById('map-canvas-container');
            if (!mapContainer) return;
            panel = document.createElement('div');
            panel.id = 'char-stats-panel';
            panel.style.backgroundColor = '#1e1f2c';
            panel.style.padding = '8px 12px';
            panel.style.marginBottom = '10px';
            panel.style.borderRadius = '12px';
            panel.style.fontSize = '13px';
            panel.style.display = 'flex';
            panel.style.justifyContent = 'space-between';
            panel.style.flexWrap = 'wrap';
            panel.style.gap = '8px';
            // 插入到地图画布容器之前
            mapContainer.parentNode.insertBefore(panel, mapContainer);
        }
        if (this.currentCharacter) {
            const c = this.currentCharacter;
            const weaponName = c.weapon ? c.weapon.name : '徒手';
            panel.innerHTML = `
                <span>❤️ ${c.health}/${c.maxHealth}</span>
                <span>💪 力量 ${c.strength}</span>
                <span>🏃 敏捷 ${c.agility}</span>
                <span>🛡️ 体质 ${c.constitution}</span>
                <span>⚔️ ${weaponName}</span>
            `;
        }
    }

    updateBattleInfoPanel() {
        const battle = this.currentBattle;
        if (!battle) return;
        const roundSpan = document.getElementById('battle-round');
        const apSpan = document.getElementById('battle-ap');
        const stepsSpan = document.getElementById('battle-steps');
        if (roundSpan) roundSpan.innerText = battle.round;
        if (battle.currentTurn === 'player') {
            if (apSpan) apSpan.innerText = battle.playerActionPoints;
            const steps = Math.floor(battle.playerActionPoints / 20);
            if (stepsSpan) stepsSpan.innerText = steps;
        } else if (battle.currentTurn === 'enemy') {
            if (apSpan) apSpan.innerText = '--';
            if (stepsSpan) stepsSpan.innerText = '--';
        }
    }
}