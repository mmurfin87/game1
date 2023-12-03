export class Point2d
{
    public static origin(): Point2d
    {
        return new Point2d(0, 0);
    }

    public static equivalent(...points: Point2d[]): boolean
    {
        if (points.length < 2)
            return true;
        const x = points[0].x, y = points[0].y;
        return points.every(p => p.x == x && p.y == y);
    }

    constructor(
        public x: number,
        public y: number
    )
    {}

    distanceSqrTo(target: Point2d): number
    {
        const x = target.x - this.x, y = target.y - this.y;
        return Math.pow(x, 2) + Math.pow(y, 2);
    }

    distanceTo(target: Point2d): number
    {
        return Math.sqrt(this.distanceSqrTo(target));
    }

    stepsTo(target: Point2d): number
    {
        return Math.max(Math.abs(target.x - this.x), Math.abs(target.y - this.y));
    }

    clone(): Point2d
    {
        return new Point2d(this.x, this.y);
    }

    add(target: Point2d): Point2d
    {
        this.x += target.x;
        this.y += target.y;
        return this;
    }

    subtract(target: Point2d): Point2d
    {
        this.x -= target.x;
        this.y -= target.y;
        return this;
    }

    unit(): Point2d
    {
        const distance = Point2d.origin().distanceTo(this);
        if (distance == 0)
            return this;
        this.x /= distance;
        this.y /= distance;
        return this;
    }

    scale(scale: number): Point2d
    {
        this.x *= scale;
        this.y *= scale;
        return this;
    }

    toString(): string
    {
        return `(${this.x},${this.y})`;
    }
}