export class Armor {
    constructor({ id, name, defense, coverage, weight, slot }) {
        this.id = id;
        this.name = name;
        this.defense = defense;
        this.coverage = coverage;
        this.weight = weight;
        this.slot = slot;
        this.upgradeCount = 0;
    }

    upgrade(type) {
        if (type === 'DEFENSE') this.defense += 1;
        else if (type === 'COVERAGE') this.coverage = Math.min(1, this.coverage + 0.05);
        this.upgradeCount++;
    }
}