import { navigateNear } from "../AStar.js";
import { GameState } from "../GameState.js";
import { Soldier } from "../Soldier.js";
import { Action } from "./Action.js";

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
		else
		{
			this.gameState.removeSoldier(this.defender);
			if (this.attacker.healthLeft > 0)
			{
				const path = navigateNear(this.gameState, this.attacker.locate(), this.defender.locate());
				if (path)
					this.attacker.move(path);
				else
					console.log("Can't move to defeated defender position!", this.attacker.locate(), this.defender.locate());
			}
		}

		this.attacker.movesLeft -= distance;
		
		if (this.attacker.healthLeft <= 0)
			this.gameState.removeSoldier(this.attacker);

		console.log(`Attacked defender at ${this.defender.locate()} which has ${this.defender.healthLeft} left`);
	}
}