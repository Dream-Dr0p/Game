import { BodyPartSlot } from '../enums/BodyPartSlot.js';

export class Armor {
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.slot = data.slot;
        this.defense = data.defense;
        this.coverage = data.coverage; // 0-1
        this.weight = data.weight;
        this.upgradeCount = 0;
    }

    upgradeDefense(inc) {
        this.defense += inc;
        this.upgradeCount++;
    }
    clone() {
        return new Armor(JSON.parse(JSON.stringify(this)));
    }
}

export const baseArmors = [
    new Armor({ id: 'leather_chest', name: '皮胸甲', slot: BodyPartSlot.CHEST, defense: 3, coverage: 0.6, weight: 3 }),
    new Armor({ id: 'leather_head', name: '皮帽', slot: BodyPartSlot.HEAD, defense: 2, coverage: 0.8, weight: 1 }),
    new Armor({ id: 'leather_arm', name: '皮护臂', slot: BodyPartSlot.LEFT_ARM, defense: 1, coverage: 0.5, weight: 1 }),
    new Armor({ id: 'leather_leg', name: '皮腿甲', slot: BodyPartSlot.LEFT_LEG, defense: 1, coverage: 0.5, weight: 1 })
];
