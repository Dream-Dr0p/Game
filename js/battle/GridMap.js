// js/battle/GridMap.js
export class GridMap {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.units = new Map(); // key: "x,y"
    }

    setUnit(unit, x, y) {
        if (unit.pos) this.units.delete(`${unit.pos.x},${unit.pos.y}`);
        unit.pos = { x, y };
        this.units.set(`${x},${y}`, unit);
    }

    getUnitAt(x, y) {
        return this.units.get(`${x},${y}`);
    }

    getDistance(posA, posB) {
        return Math.abs(posA.x - posB.x) + Math.abs(posA.y - posB.y);
    }

    isValidMove(unit, targetX, targetY) {
        if (targetX < 0 || targetX >= this.width || targetY < 0 || targetY >= this.height) return false;
        if (this.getUnitAt(targetX, targetY)) return false;
        const dist = this.getDistance(unit.pos, { x: targetX, y: targetY });
        return dist <= unit.getMoveRange() && dist > 0;
    }

    getCloserPosition(from, to, maxSteps) {
        // 优先向目标方向移动一格
        const dx = Math.sign(to.x - from.x);
        const dy = Math.sign(to.y - from.y);
        const candidates = [];
        if (dx !== 0) candidates.push({ x: from.x + dx, y: from.y });
        if (dy !== 0) candidates.push({ x: from.x, y: from.y + dy });
        // 如果斜角移动允许（按曼哈顿距离），也尝试斜角？不，斜角需要两步，先不考虑
        for (let cand of candidates) {
            if (cand.x >= 0 && cand.x < this.width && cand.y >= 0 && cand.y < this.height && !this.getUnitAt(cand.x, cand.y)) {
                return cand;
            }
        }
        // 若无法向目标移动，尝试任意相邻空格
        const allNeighbors = [
            { x: from.x + 1, y: from.y }, { x: from.x - 1, y: from.y },
            { x: from.x, y: from.y + 1 }, { x: from.x, y: from.y - 1 }
        ];
        for (let nb of allNeighbors) {
            if (nb.x >= 0 && nb.x < this.width && nb.y >= 0 && nb.y < this.height && !this.getUnitAt(nb.x, nb.y)) {
                return nb;
            }
        }
        return { x: from.x, y: from.y }; // 无路可走
    }
}