import { GameState } from "../GameState";
import { Soldier } from "../Soldier";
import { Action } from "./Action";

export class AttackSoldierAction implements Action
{
	constructor(
		private readonly attacker: Soldier,
		private readonly defender: Soldier,
		private readonly gameState: GameState
	)
	{}

	execute(): void
	{
		const distance = this.attacker.locate().stepsTo(this.defender.locate());
		if (this.attacker.movesLeft < distance)
			throw new Error("Not enough moves to attack");
		this.defender.healthLeft -= 5;
		if (this.defender.healthLeft > 0)
			this.attacker.healthLeft -= 6;
		console.log(`Attacked defender at ${this.defender.locate()} which has ${this.defender.healthLeft} left`);
		if (this.removeSoldierIfDead(this.defender) && this.gameState.search(this.defender.row, this.defender.col).length == 0)
			this.attacker.moveTo(this.gameState.currentTurn, this.gameState.currentTime, this.defender.locate());
		this.removeSoldierIfDead(this.attacker);
		
		this.attacker.movesLeft -= distance;
	}

	private removeSoldierIfDead(soldier: Soldier): boolean
	{
		if (soldier.healthLeft <= 0)
		{
			const index = this.gameState.soldiers.findIndex(e => e == soldier);
			if (index < 0 || index > this.gameState.soldiers.length)
				throw new Error("can't find soldier in gamestate soldiers list");
			console.log(`Removing soldier from index ${index}`);
			this.gameState.soldiers.splice(index, 1);
			if (this.gameState.selection == soldier)
				this.gameState.selection = null;
			return true;
		}
		else
			return false;
	}
}