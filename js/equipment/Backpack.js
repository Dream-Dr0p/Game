export class Backpack {
    constructor() {
        this.weapons = [];
        this.armors = [];
        this.consumables = [];
        this.weightReduction = 0.5; // 减免50%
    }

    addItem(item) {
        if(item instanceof Weapon) this.weapons.push(item);
        else if(item instanceof Armor) this.armors.push(item);
        else this.consumables.push(item);
    }

    removeItem(type, index) {
        if(type === 'weapon') return this.weapons.splice(index,1)[0];
        if(type === 'armor') return this.armors.splice(index,1)[0];
        return this.consumables.splice(index,1)[0];
    }

    getTotalWeight() {
        const sum = [...this.weapons, ...this.armors, ...this.consumables].reduce((s,i)=> s + (i.weight||0),0);
        return sum * (1 - this.weightReduction);
    }

    getAllItems() {
        return [...this.weapons, ...this.armors, ...this.consumables];
    }
}