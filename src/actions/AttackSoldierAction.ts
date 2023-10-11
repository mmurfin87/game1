import { Soldier } from "../Soldier";
import { Action } from "./Action";

export class AttackSoldierAction implements Action
{
	constructor(
		private readonly attacker: Soldier,
		private readonly defender: Soldier
	)
	{}

	execute(): void
	{
		const distance = this.attacker.position().stepsTo(this.defender.position());
		if (this.attacker.movesLeft < distance)
			throw new Error("Not enough moves to attack");
		this.defender.health -= 1;
		this.attacker.movesLeft -= distance;
	}
}