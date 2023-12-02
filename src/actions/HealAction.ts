import { aStar } from "../AStar.js";
import { GameState } from "../GameState.js";
import { Point2d } from "../Point2d.js";
import { Positioned } from "../Positioned.js";
import { Soldier } from "../Soldier.js";
import { Action } from "./Action.js";

type Search = (row: number, col: number) => Positioned[];

export class HealAction implements Action
{
    constructor(private readonly selection: Soldier)
    {}

    execute(): void
    {
        this.selection.healthLeft = Math.min(this.selection.health, Math.floor(this.selection.healthLeft + this.selection.health * 0.33));
		this.selection.movesLeft = 0;
    }
}