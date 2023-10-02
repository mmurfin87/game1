import { Point2d } from "./Point2d";

export class Rect2d
{
    constructor(
        public min: Point2d,
        public max: Point2d
    )
    {
        if (max.x < min.x || max.y < min.y)
        {
            const tmp = min;
            this.min = max;
            this.max = tmp;
        }
    }

    includes(point: Point2d): boolean
    {
        return !(this.min.x > point.x || this.max.x < point.x || this.min.y > point.y || this.max.y < point.y);
    }
}