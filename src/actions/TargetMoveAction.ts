import { Player } from "../Player.js";
import { Point2d } from "../Point2d.js";
import { Positioned } from "../Positioned.js";
import { Soldier } from "../Soldier.js";
import { Action, ActionContinuation, ActionExecutionState } from "./Action.js";

type Search = (row: number, col: number) => Positioned[];

export class TargetMoveAction implements Action
{
    constructor(private selection: Soldier)
    {}

    name(): string
    {
        return "Move";
    }

    prepare(): number
    {
        return 1;
    }

    execute(): ActionContinuation
    {
        return new ActionContinuation(ActionExecutionState.NEED_GRID_COORDS, (arg) => {
            const coords = arg as Point2d;
            console.log(`Received Order to move ${this.selection.type} at (${this.selection.col},${this.selection.row}) to (${coords.x},${coords.y})`);
            this.selection.moveTo(coords);
        });
    }
}