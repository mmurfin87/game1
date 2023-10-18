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
        private readonly coords: Point2d,
        private readonly gameState: GameState
    )
    {}

    execute(): void
    {
        const path = aStar(this.gameState, this.selection.position(), this.coords);
        this.selection.move(this.gameState.currentTurn, this.gameState.currentTime, path);
    }
}