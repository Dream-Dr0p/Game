export class Weapon {
    constructor({ id, name, type, attack, penetrationPower, penetrationRate, range, weight, specialAbility = null }) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.attack = attack;
        this.penetrationPower = penetrationPower;
        this.penetrationRate = penetrationRate;
        this.range = range;
        this.weight = weight;
        this.specialAbility = specialAbility;
        this.upgradeCount = 0;
    }

    upgrade(type) {
        // 与 PM“装备强化”三选一一致：允许对关键字段进行小幅提升
        if (type === 'ATTACK') this.attack += 2;
        else if (type === 'PENETRATION_POWER') this.penetrationPower += 1;
        else if (type === 'PENETRATION_RATE') this.penetrationRate = Math.min(1, this.penetrationRate + 0.05);
        else if (type === 'RANGE') this.range += 1;
        this.upgradeCount++;
    }
}