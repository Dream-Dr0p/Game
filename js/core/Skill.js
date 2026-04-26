export class Skill {
    constructor(value = 0) {
        this.value = Math.floor(value);
    }

    addExperience(gain) {
        this.value += gain;
        if(this.value < 0) this.value = 0;
    }

    getHitBonus() {
        return this.value / (this.value + 100);
    }

    getWeakSpotBonus() {
        return Math.min(0.7, this.value / 200);
    }

    getCritRate() {
        return Math.min(0.4, this.value / (this.value + 100) * 0.8);
    }

    getCritMultiplier() {
        const rand = Math.random();
        if(rand < 0.7) return 1.2;
        if(rand < 0.95) return 1.5;
        return 2.0;
    }
}