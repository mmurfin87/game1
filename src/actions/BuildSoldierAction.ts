import { City } from "../City.js";
import { Player } from "../Player.js";
import { Soldier } from "../Soldier.js";
import { Action, ActionContinuation } from "./Action.js";

export class BuildSoldierAction implements Action
{
    constructor(private humanPlayer: Player, private selection: City, private soldiers: Soldier[])
    {}

    name(): string
    {
        return "Train Soldier";
    }
    
    prepare(): number
    {
        return 1;
    }

    execute(): ActionContinuation
    {
        this.soldiers.push(new Soldier(this.selection.row, this.selection.col, this.humanPlayer, 1));
        return ActionContinuation.complete();
    }
}