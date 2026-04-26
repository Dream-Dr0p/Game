import { WeaponType } from '../enums/WeaponType.js';

export class Weapon {
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.type = data.type;
        this.attack = data.attack;
        this.penetrationPower = data.penetrationPower;
        this.penetrationRate = data.penetrationRate;
        this.range = data.range;
        this.weight = data.weight;
        this.special = data.special || null;
        this.upgradeCount = 0;
    }

    upgradeAttack(inc) {
        this.attack += inc;
        this.upgradeCount++;
    }

    clone() {
        return new Weapon(JSON.parse(JSON.stringify(this)));
    }
}

// 预设基础武器
export const baseWeapons = [
    new Weapon({ id: 'shortsword', name: '短剑', type: WeaponType.ONE_HANDED_SWORD, attack: 12, penetrationPower: 2, penetrationRate: 0.6, range: 2, weight: 2 }),
    new Weapon({ id: 'dagger', name: '匕首', type: WeaponType.DAGGER, attack: 9, penetrationPower: 3, penetrationRate: 0.5, range: 1, weight: 1 }),
    new Weapon({ id: 'wooden_stick', name: '木棍', type: WeaponType.SPEAR, attack: 10, penetrationPower: 1, penetrationRate: 0.8, range: 2, weight: 3 }),
    new Weapon({ id: 'hand_axe', name: '手斧', type: WeaponType.AXE, attack: 14, penetrationPower: 2, penetrationRate: 0.55, range: 2, weight: 3 })
];

export const FIST_WEAPON = new Weapon({
    id: 'fist',
    name: '徒手',
    type: WeaponType.UNARMED,
    attack: 8,
    penetrationPower: 0,
    penetrationRate: 0.75,
    range: 1,
    weight: 0,
    special: null
});