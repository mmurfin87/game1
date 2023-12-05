import { City } from "../City.js";
import { EventDispatch } from "../EventDispatch.js";
import { GameState } from "../GameState.js";
import { Player } from "../Player.js";
import { Soldier } from "../Soldier.js";
import { NewSoldierEvent } from "../events/NewSoldierEvent.js";
import { Action } from "./Action.js";

export class BuildSoldierAction implements Action
{
    constructor(
		private readonly dispatch: EventDispatch,
		private readonly gameState: GameState,
		private readonly player: Player, 
		private readonly selection: City)
    {}

    execute(): void
    {
		if (this.selection.movesLeft < 1)
			throw new Error("Not enough moves");
		
		const soldier = new Soldier(Soldier.nextId(), this.selection.row, this.selection.col, this.player, 2, 10, 0);
		this.dispatch.dispatch(new NewSoldierEvent(soldier.id, soldier.locate(), 2));
		if (!soldier.position(this.gameState, soldier.locate()))
			throw new Error(`Can't build soldier: Something already occupies ${soldier.locate()}`);
		this.selection.movesLeft -= 1;
        this.gameState.soldiers.push(soldier);
    }
}