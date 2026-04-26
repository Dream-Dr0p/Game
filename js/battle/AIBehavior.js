class SimpleAI {
    chooseAction(battle, enemy) {
        const player = battle.player;
        if (!player || !player.isAlive()) return { type: 'wait' };
        const dist = battle.grid.getDistance(enemy.pos, player.pos);
        
        if (dist > enemy.weapon.range) {
            // 移动：返回目标坐标
            const targetPos = battle.grid.getCloserPosition(enemy.pos, player.pos, enemy.getMoveRange());
            return { type: 'move', x: targetPos.x, y: targetPos.y };
        } else {
            // 攻击：必须包含 target 和 part
            const targetPart = player.bodyParts[Math.floor(Math.random() * player.bodyParts.length)];
            return { type: 'attack', target: player, part: targetPart.slot };
        }
    }
}

export const enemyTemplates = [
    {
        name: '地精斥候', str: 8, agi: 12, con: 8,
        weapon: baseWeapons[1], //匕首
        armors: [],
        skills: { [WeaponType.DAGGER]: 15 }
    },
    {
        name: '兽人战士', str: 15, agi: 8, con: 14,
        weapon: baseWeapons[3], //手斧
        armors: [],
        skills: { [WeaponType.AXE]: 20 }
    }
];