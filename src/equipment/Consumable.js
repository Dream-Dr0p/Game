export class Consumable {
    constructor({ id, name, weight, effects }) {
        this.id = id;
        this.name = name;
        this.weight = weight;
        this.effects = effects || [];
    }

    use(target) {
        // effects: { type: 'HEAL_PERCENT'|'HEAL_FLAT'|'CLEANSE', value?:number }
        for (const eff of this.effects) {
            if (eff.type === 'HEAL_PERCENT') {
                const amt = Math.floor((target.maxHealth || 0) * (eff.value ?? 0));
                target.currentHealth = Math.min(target.maxHealth, target.currentHealth + amt);
            } else if (eff.type === 'HEAL_FLAT') {
                target.currentHealth = Math.min(target.maxHealth, target.currentHealth + (eff.value ?? 0));
            } else if (eff.type === 'CLEANSE') {
                if (Array.isArray(target.statuses)) target.statuses = [];
            }
        }
        return true;
    }
}