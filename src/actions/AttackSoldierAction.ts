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
		const distance = this.attacker.position().stepsTo(this.defender.position());
		if (this.attacker.movesLeft < distance)
			throw new Error("Not enough moves to attack");
		this.defender.health -= 5;
		this.attacker.health -= 6
		console.log(`Attacked defender at ${this.defender.position()} which has ${this.defender.health} left`);
		if (this.removeSoldierIfDead(this.defender))
			this.attacker.moveTo(this.gameState.currentTurn, this.gameState.currentTime, this.defender.position());
		this.removeSoldierIfDead(this.attacker);
		
		//this.attacker.movesLeft -= distance;
	}

	private removeSoldierIfDead(soldier: Soldier): boolean
	{
		if (soldier.health <= 0)
		{
			const index = this.gameState.soldiers.findIndex(e => e == soldier);
			if (index < 0 || index > this.gameState.soldiers.length)
				throw new Error("can't find soldier in gamestate soldiers list");
			console.log(`Removing soldier from index ${index}`);
			this.gameState.soldiers.splice(index, 1);
			return true;
		}
		else
			return false;
	}
}