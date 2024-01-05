export class Point2d {
    x;
    y;
    static origin() {
        return new Point2d(0, 0);
    }
    static equivalent(...points) {
        if (points.length < 2)
            return true;
        const x = points[0].x, y = points[0].y;
        return points.every(p => p.x == x && p.y == y);
    }
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    distanceSqrTo(target) {
        const x = target.x - this.x, y = target.y - this.y;
        return Math.pow(x, 2) + Math.pow(y, 2);
    }
    distanceTo(target) {
        return Math.sqrt(this.distanceSqrTo(target));
    }
    stepsTo(target) {
        return Math.max(Math.abs(target.x - this.x), Math.abs(target.y - this.y));
    }
    clone() {
        return new Point2d(this.x, this.y);
    }
    add(target) {
        this.x += target.x;
        this.y += target.y;
        return this;
    }
    subtract(target) {
        this.x -= target.x;
        this.y -= target.y;
        return this;
    }
    unit() {
        const distance = Point2d.origin().distanceTo(this);
        if (distance == 0)
            return this;
        this.x /= distance;
        this.y /= distance;
        return this;
    }
    scale(scale) {
        this.x *= scale;
        this.y *= scale;
        return this;
    }
    toString() {
        return `(${this.x},${this.y})`;
    }
}
