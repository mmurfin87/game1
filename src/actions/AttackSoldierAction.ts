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
		this.defender.health -= 1;
		console.log(`Attacked defender at ${this.defender.position()} which has ${this.defender.health} left`);
		if (this.defender.health <= 0)
		{
			const index = this.gameState.soldiers.findIndex(e => e == this.defender);
			if (index < 0 || index > this.gameState.soldiers.length)
				throw new Error("can't find defender in gamestate soldiers list");
			console.log(`Removing Defender from index ${index}`);
			this.gameState.soldiers.splice(index, 1);
			this.attacker.moveTo(this.gameState.currentTurn, this.gameState.currentTime, this.defender.position());
		}
		
		this.attacker.movesLeft -= distance;
	}
}