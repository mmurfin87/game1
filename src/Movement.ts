import { Point2d } from "./Point2d";

export class MoveOptions
{
    constructor(
        public options: Point2d[]
    )
    {}

    isValidChoice(x: number, y: number): boolean
    {
        return this.options.find(p => p.x == x && p.y == y) != null;
    }
}

export function calculateMovement() : MoveOptions
{
    return new MoveOptions([]);
}