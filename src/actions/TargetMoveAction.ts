import { Point2d } from "../Point2d.js";
import { Soldier } from "../Soldier.js";
import { AbstractAction, Action } from "./Action.js";

export interface TargetMoveActionData
{
    targetCoords: Point2d;
}

export class TargetMoveAction extends AbstractAction<TargetMoveActionData>
{
    constructor(private selection: Soldier)
    {
        super("Move", { targetCoords: new Point2d(-1, -1) });
    }

    execute(): void
    {
        console.log(`Received Order to move ${this.selection.type} at (${this.selection.col},${this.selection.row}) to (${coords.x},${coords.y})`);
        this.selection.moveTo(this.data.targetCoords);
    }
}