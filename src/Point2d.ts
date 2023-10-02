export class Point2d
{
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

    unit(): Point2d
    {
        const p = new Point2d(0, 0);
        const distance = p.distanceTo(this);
        p.x = this.x / distance;
        p.y = this.y / distance;
        return p;
    }

    scale(scale: number): Point2d
    {
        this.x /= scale;
        this.y /= scale;
        return this;
    }

    stepScale(stepSize: number): Point2d
    {
        this.x = Math.floor(this.x / stepSize);
        this.y = Math.floor(this.y / stepSize);
        return this;
    }

    steps(stepSize: number, target: Point2d): number
    {
        let stepCount = 0;
        let origin = this;
        const stepSizeSqr = Math.pow(stepSize, 2);
        while (origin.distanceSqrTo(target) > stepSizeSqr)
        {

            stepCount++;
        }
        return stepCount;
    }
}