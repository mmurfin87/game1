import { City } from "../City.js";
import { GameState } from "../GameState.js";
import { Player } from "../Player.js";
import { Soldier } from "../Soldier.js";
import { Action } from "./Action.js";

export class BuildSoldierAction implements Action
{
    constructor(
		private readonly gameState: GameState,
		private readonly player: Player, 
		private readonly selection: City)
    {}

    execute(): void
    {
		if (this.selection.movesLeft < 1)
			throw new Error("Not enough moves");
		this.selection.movesLeft -= 1;
		const soldier = new Soldier(this.selection.row, this.selection.col, this.player, 2, 10, 0);
		soldier.position(this.gameState, soldier.locate());
        this.gameState.soldiers.push(soldier);
    }
}