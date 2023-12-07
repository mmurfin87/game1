import { City } from "../City.js";
import { Archetype } from "../Entity.js";
import { Player } from "../Player.js";
import { Positioned } from "../Positioned.js";
import { Soldier } from "../Soldier.js";
import { Action } from "./Action.js";

type Search = (row: number, col: number) => Positioned[];

export class SettleAction implements Action
{
	constructor(
		private readonly player: Player, 
		private readonly selection: Archetype<['movement']>, 
		private readonly settlement: City)
	{}

	execute(): void
	{
		if (this.selection.movement.movesLeft < 1)
			throw new Error("Not enough moves");
		if (this.settlement.player == this.player)
			throw new Error("Player already owns this settlement");
		this.selection.movement.movesLeft -= 1;
		this.settlement.player = this.player;
	}
}