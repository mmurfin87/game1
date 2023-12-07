import { City } from "../City.js";
import { Player } from "../Player.js";
import { Soldier } from "../Soldier.js";

export class PlayerSelectionEvent
{
	static readonly name = 'PlayerSelection';

	public readonly name = PlayerSelectionEvent.name;

	constructor(
		public readonly player: Player,
		public readonly selection: Soldier | City | null
	)
	{}
}