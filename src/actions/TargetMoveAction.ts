import { Player } from "../Player.js";
import { Point2d } from "../Point2d.js";
import { Positioned } from "../Positioned.js";
import { Soldier } from "../Soldier.js";
import { Action } from "./Action.js";

type Search = (row: number, col: number) => Positioned[];

export class TargetMoveAction implements Action
{
    constructor(
        private readonly selection: Soldier,
        private readonly coords: Point2d)
    {}

    execute(): void
    {
        const distanceToTarget: number = new Point2d(this.selection.col, this.selection.row).stepsTo(this.coords);
        if (distanceToTarget > this.selection.movesLeft ||!this.selection.moveTo(this.coords))
            throw new Error("Unable to move");
        this.selection.movesLeft -= distanceToTarget;
    }
}