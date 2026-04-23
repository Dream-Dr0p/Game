// 主入口：负责视图切换、事件绑定、协调核心类
import { Character } from './src/core/Character.js';
import { Weapon } from './src/equipment/Weapon.js';
import { Armor } from './src/equipment/Armor.js';
import { Backpack } from './src/equipment/Backpack.js';
import { WeaponType } from './src/enums/WeaponType.js';
import { BodyPartSlot } from './src/enums/BodyPartSlot.js';

// ---------- 基础装备模板 (用于初始选择) ----------
const BASE_WEAPONS = [
    new Weapon({ id: 'short_sword', name: '短剑', type: WeaponType.ONE_HANDED_SWORD, attack: 12, penetrationPower: 2, penetrationRate: 0.6, range: 1, weight: 2.0 }),
    new Weapon({ id: 'wooden_club', name: '木棍', type: WeaponType.HAMMER, attack: 10, penetrationPower: 1, penetrationRate: 0.8, range: 2, weight: 3.0 }),
    new Weapon({ id: 'dagger', name: '匕首', type: WeaponType.DAGGER, attack: 9, penetrationPower: 3, penetrationRate: 0.5, range: 1, weight: 1.0 }),
    new Weapon({ id: 'hand_axe', name: '手斧', type: WeaponType.AXE, attack: 14, penetrationPower: 4, penetrationRate: 0.4, range: 1, weight: 3.5 }),
    new Weapon({ id: 'spear', name: '长矛', type: WeaponType.SPEAR, attack: 11, penetrationPower: 2, penetrationRate: 0.7, range: 2, weight: 2.8 })
];

const BASE_ARMORS = [
    new Armor({ id: 'leather_helm', name: '皮盔', defense: 2, coverage: 0.8, weight: 1.0, slot: BodyPartSlot.HEAD }),
    new Armor({ id: 'leather_vest', name: '皮背心', defense: 3, coverage: 0.6, weight: 3.0, slot: BodyPartSlot.CHEST }),
    new Armor({ id: 'leather_gloves', name: '皮手套', defense: 1, coverage: 0.5, weight: 0.8, slot: BodyPartSlot.LEFT_ARM }),
    new Armor({ id: 'leather_boots', name: '皮靴', defense: 1, coverage: 0.5, weight: 1.2, slot: BodyPartSlot.LEFT_LEG })
];

// 全局状态
let currentView = 'main';
let activeCharacter = null;
let selectedIndices = [];
const SAVE_KEY = 'roguelike_save';

const viewEl = document.getElementById('app-view');

// ---------- 渲染函数 ----------
function render() {
    if (currentView === 'main') renderMainMenu();
    else if (currentView === 'create') renderCreation();
    else if (currentView === 'dungeon') renderDungeonMap();
}

function renderMainMenu() {
    viewEl.innerHTML = `
        <div class="card" style="max-width:460px; margin:30px auto;">
            <h2 style="color:#cdb282;">🏰 主菜单</h2>
            <div style="display:flex; flex-direction:column; gap:18px;">
                <button class="btn btn-primary" id="btn-new">✨ 创建新角色</button>
                <button class="btn" id="btn-load" disabled>📂 继续游戏 (暂无)</button>
                <hr style="border-color:#2a4055;">
                <p style="color:#93adc2;">基于模块化骨架: Character, Weapon, Armor...</p>
            </div>
        </div>
    `;
    document.getElementById('btn-new').addEventListener('click', () => {
        currentView = 'create';
        selectedIndices = [];
        render();
    });
}

function renderCreation() {
    const weaponHtml = BASE_WEAPONS.map((w, i) => `
        <div class="item-card ${selectedIndices.includes(i)?'selected':''}" data-type="weapon" data-index="${i}">
            <div class="item-name">⚔️ ${w.name}</div>
            <div>攻击 ${w.attack} 穿透 ${w.penetrationPower} (${Math.round(w.penetrationRate*100)}%) 射程 ${w.range} 重 ${w.weight}</div>
        </div>
    `).join('');
    const armorHtml = BASE_ARMORS.map((a, i) => {
        const globalIdx = BASE_WEAPONS.length + i;
        return `
        <div class="item-card ${selectedIndices.includes(globalIdx)?'selected':''}" data-type="armor" data-index="${i}">
            <div class="item-name">🛡️ ${a.name}</div>
            <div>防御 ${a.defense} 覆盖 ${Math.round(a.coverage*100)}% 部位 ${a.slot} 重 ${a.weight}</div>
        </div>
    `}).join('');

    viewEl.innerHTML = `
        <div class="card">
            <h2>📜 创建角色</h2>
            <label>角色名称</label>
            <input type="text" id="char-name" class="input" value="冒险者" style="width:100%; padding:10px; border-radius:40px; background:#0d1722; border:1px solid #3f5a74; color:white;">
            <div style="margin:20px 0"><strong>选择两件初始装备</strong> <span style="color:#e0b354;">${selectedIndices.length}/2</span></div>
            <div class="grid-2col">${weaponHtml}${armorHtml}</div>
            <div style="color:#f0a06a;" id="warning"></div>
            <div style="display:flex; gap:16px; margin-top:24px;">
                <button class="btn" id="btn-back">返回</button>
                <button class="btn btn-primary" id="btn-start" ${selectedIndices.length===2?'':'disabled'}>开始冒险</button>
            </div>
        </div>
    `;

    document.querySelectorAll('.item-card').forEach(card => {
        card.addEventListener('click', () => {
            const type = card.dataset.type;
            const idx = parseInt(card.dataset.index);
            let globalIdx = idx;
            if (type === 'armor') globalIdx = BASE_WEAPONS.length + idx;
            if (selectedIndices.includes(globalIdx)) {
                selectedIndices = selectedIndices.filter(i => i !== globalIdx);
            } else {
                if (selectedIndices.length >= 2) {
                    document.getElementById('warning').innerText = '最多选择两件';
                    return;
                }
                selectedIndices.push(globalIdx);
            }
            renderCreation();
        });
    });

    document.getElementById('btn-back').addEventListener('click', () => {
        currentView = 'main';
        render();
    });
    document.getElementById('btn-start').addEventListener('click', () => {
        if (selectedIndices.length !== 2) return;
        const name = document.getElementById('char-name').value.trim() || '无名';
        // 创建角色（骨架类）
        const character = Character.createCharacter(name, 10, 10, 10);
        selectedIndices.map(idx => {
            if (idx < BASE_WEAPONS.length) return BASE_WEAPONS[idx];
            else return BASE_ARMORS[idx - BASE_WEAPONS.length];
        }).forEach(item => {
            if (item instanceof Weapon) {
                if (!character.weapon) character.equipWeapon(item);
                else character.backpack.addItem(item);
            } else if (item instanceof Armor) {
                if (!character.armors[item.slot]) character.equipArmor(item, item.slot);
                else character.backpack.addItem(item);
            }
        });
        character.recordAdventureStartAttributes();
        // 保存
        const saves = JSON.parse(localStorage.getItem(SAVE_KEY) || '[]');
        saves.push(character);
        localStorage.setItem(SAVE_KEY, JSON.stringify(saves));
        activeCharacter = character;
        currentView = 'dungeon';
        render();
    });
}

function renderDungeonMap() {
    if (!activeCharacter) { currentView = 'main'; render(); return; }
    const c = activeCharacter;
    viewEl.innerHTML = `
        <div class="card" style="height:100%">
            <div style="display:flex; justify-content:space-between;">
                <h2>🗺️ 第 ${c.floor} 层</h2> <span>💰 ${c.currency}</span>
            </div>
            <div>❤️ ${c.currentHealth}/${c.maxHealth}  ⚔️ ${c.weapon?c.weapon.name:'徒手'}</div>
            <div style="display:flex; justify-content:center; gap:30px; margin:40px 0;">
                <div style="width:80px;height:80px;background:#1e3345;border-radius:40px;display:flex;align-items:center;justify-content:center;border:3px solid #3a698b;">⚔️</div>
                <div style="width:80px;height:80px;background:#1e3345;border-radius:40px;display:flex;align-items:center;justify-content:center;border:3px solid #3a698b;">❓</div>
                <div style="width:80px;height:80px;background:#1e3345;border-radius:40px;display:flex;align-items:center;justify-content:center;border:3px solid #3a698b;">👑</div>
            </div>
            <p style="color:#aaa;">武器技艺值: ${[...c.skills.entries()].map(([k,v])=>`${k}:${v.value}`).join(' ')}</p>
            <button class="btn" id="btn-exit">返回主菜单</button>
        </div>
    `;
    document.getElementById('btn-exit').addEventListener('click', () => {
        currentView = 'main';
        activeCharacter = null;
        render();
    });
}

// 启动
render();