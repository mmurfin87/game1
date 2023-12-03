import { aStar } from "../AStar.js";
import { GameState } from "../GameState.js";
import { Point2d } from "../Point2d.js";
import { Positioned } from "../Positioned.js";
import { Soldier } from "../Soldier.js";
import { Action } from "./Action.js";

type Search = (row: number, col: number) => Positioned[];

export class TargetMoveAction implements Action
{
    constructor(
        private readonly selection: Soldier,
        private readonly path: Point2d[]
    )
    {}

    execute(): void
    {
        this.selection.move(this.path);
    }
}