import { Archetype, Entity } from "../Entity.js";
import { Action } from "./Action.js";

export class HealAction implements Action
{
    constructor(private readonly selection: Archetype<['health']>)
    {}

    execute(entities: Entity[]): void
    {
        this.selection.health.remaining = Math.min(this.selection.health.amount, Math.floor(this.selection.health.remaining + this.selection.health.amount * 0.4));
        if (this.selection.actionable)
            this.selection.actionable.remaining = 0;
    }
}