// js/battle/ActionBar.js
export class ActionBar {
    constructor(units) {
        this.units = units;
        this.progress = new Map();
        for (let u of units) this.progress.set(u, 0);
    }

    tick() {
        for (let u of this.units) {
            if (!u.isAlive()) continue;
            let inc = u.getSpeed();
            let val = this.progress.get(u) + inc;
            // 限制最大100，防止溢出
            val = Math.min(100, val);
            this.progress.set(u, val);
        }
    }

    getReady() {
        for (let u of this.units) {
            if (this.progress.get(u) >= 100 && u.isAlive()) return u;
        }
        return null;
    }

    consume(unit, percent) {
        let cur = this.progress.get(unit);
        this.progress.set(unit, Math.max(0, cur - percent));
    }

    reset(unit) {
        this.progress.set(unit, 0);
    }
}