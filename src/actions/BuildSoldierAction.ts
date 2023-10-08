import { City } from "../City.js";
import { Player } from "../Player.js";
import { Soldier } from "../Soldier.js";
import { PreparedAction } from "./Action.js";

export class BuildSoldierAction extends PreparedAction
{
	constructor(private player: Player, private selection: City, private soldiers: Soldier[])
	{
		super("Train Soldier");
	}
	
	execute(): void
	{
		//if (this.soldiers.find(s => s.col == this.selection.col && s.row == this.selection.row && s.player != this.player))
		//    throw new Error("Can't build soldiers in cities that aren't yours");
		this.soldiers.push(new Soldier(this.selection.row, this.selection.col, this.player, 1));
	}
}