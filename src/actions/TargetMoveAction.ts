import { aStar } from "../AStar.js";
import { EventDispatch } from "../EventDispatch.js";
import { GameState } from "../GameState.js";
import { Point2d } from "../Point2d.js";
import { Positioned } from "../Positioned.js";
import { Soldier } from "../Soldier.js";
import { MoveOrderEvent } from "../events/MoveOrderEvent.js";
import { Action } from "./Action.js";

type Search = (row: number, col: number) => Positioned[];

export class TargetMoveAction implements Action
{
    constructor(
        private readonly dispatch: EventDispatch,
        private readonly selection: Soldier,
        private readonly path: Point2d[]
    )
    {}

    execute(): void
    {
        this.dispatch.dispatch(new MoveOrderEvent(this.selection.id, this.path));
        this.selection.move(this.path);
    }
}