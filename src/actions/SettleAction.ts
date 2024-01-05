import { Archetype } from "../Entity.js";
import { Player } from "../Player.js";
import { Action } from "./Action.js";

export class SettleAction implements Action
{
	constructor(
		private readonly player: Player, 
		private readonly selection: Archetype<['actionable']>, 
		private readonly settlement: Archetype<['player', 'position']>
	)
	{}

	execute(): void
	{
		if (this.selection.actionable.remaining < 1)
			throw new Error("Not enough moves");
		if (this.settlement.player == this.player)
			throw new Error("Player already owns this settlement");
		this.selection.actionable.remaining -= 1;
		this.settlement.player = this.player;
	}
}