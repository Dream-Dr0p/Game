export class Consumable {
    constructor(id, name, weight, effect) {
        this.id = id;
        this.name = name;
        this.weight = weight;
        this.effect = effect; // { type, value, isPermanent }
    }

    use(target) {
        if(this.effect.type === 'heal') {
            target.health = Math.min(target.maxHealth, target.health + this.effect.value);
        }
        if(this.effect.type === 'permStr') {
            target.strength += this.effect.value;
        }
        // 简化其他效果
    }
}