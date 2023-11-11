import { City } from "../City.js";
import { Player } from "../Player.js";
import { Soldier } from "../Soldier.js";
import { Action } from "./Action.js";

export class BuildSoldierAction implements Action
{
    constructor(
		private readonly humanPlayer: Player, 
		private readonly selection: City, 
		private readonly soldiers: Soldier[])
    {}

    execute(): void
    {
		if (this.selection.movesLeft < 1)
			throw new Error("Not enough moves");
		this.selection.movesLeft -= 1;
        this.soldiers.push(new Soldier(this.selection.row, this.selection.col, this.humanPlayer, 1, 10, 0));
    }
}