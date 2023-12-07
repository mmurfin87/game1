import { Archetype, Entity, isArchetype } from "../Entity.js";
import { Positioned } from "../Positioned.js";
import { Soldier } from "../Soldier.js";
import { Action } from "./Action.js";

type Search = (row: number, col: number) => Positioned[];

export class HealAction implements Action
{
    constructor(private readonly selection: Archetype<['health']>)
    {}

    execute(entities: Entity[]): void
    {
        this.selection.health.remaining = Math.min(this.selection.health.amount, Math.floor(this.selection.health.remaining + this.selection.health.amount * 0.33));
        if (this.selection.movement)
            this.selection.movement.movesLeft = 0;
    }
}