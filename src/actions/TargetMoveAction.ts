import { City } from "../City.js";
import { Player } from "../Player.js";
import { Positioned } from "../Positioned.js";
import { Soldier } from "../Soldier.js";
import { Action } from "./Action.js";

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

    execute(): void
    {
        
    }
}