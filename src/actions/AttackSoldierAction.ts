import { navigateNear } from "../AStar.js";
import { Archetype, Entity } from "../Entity.js";
import { GameState } from "../GameState.js";
import { Action } from "./Action.js";

export class AttackSoldierAction implements Action
{
	constructor(
		private readonly attacker: Archetype<['position', 'movement', 'health']>,
		private readonly defender: Archetype<['position', 'movement', 'health']>,
		private readonly gameState: GameState
	)
	{}

	execute(entities: Entity[]): void
	{
		const distance = this.attacker.position.position.stepsTo(this.defender.position.position);
		if (this.attacker.movement.movesLeft < distance)
			throw new Error("Not enough moves to attack");

		const origHealth = this.defender.health.remaining;
		this.defender.health.remaining -= Math.max(1, Math.floor(this.attacker.health.remaining / 2));

		if (this.defender.health.remaining > 0)
			this.attacker.health.remaining -= Math.floor((origHealth * 1.2) / 2);
		else
		{
			const defenderIndex = entities.indexOf(this.defender);
			if (defenderIndex != -1)
				entities.splice(defenderIndex, 1);
			if (this.attacker.health.remaining > 0)
			{
				const path = navigateNear(this.gameState, this.attacker.position.position, this.defender.position.position);
				if (path)
				{
					this.attacker.movement.path = [this.attacker.position.position, this.defender.position.position];	// this is a hack until i replace collision detection in the AStar algorithm with ECS components instead of soldiers
					this.attacker.movement.stepStart = null;
					this.attacker.movement.wait = false;
				}
				else
					console.log("Can't move to defeated defender position!", this.attacker.position.position, this.defender.position.position);
			}
		}

		this.attacker.movement.movesLeft -= distance;
		if (this.attacker.health.remaining <= 0)
		{
			const attackerIndex = entities.indexOf(this.attacker);
			if (attackerIndex != -1)
				entities.splice(attackerIndex, 1);
		}

		/*
        if (attackerEntity)
            attackerEntity.movement = new Movement(this.path, null, 500, false, 2, 2);

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
		*/
		console.log(`Attacked defender at ${this.defender.position.position} which has ${this.defender.health.remaining} left`);
	}
}