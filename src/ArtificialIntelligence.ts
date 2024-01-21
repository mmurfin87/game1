import { navigateNear } from "./AStar.js";
import { City } from "./City.js";
import { Archetype, Entity, isArchetype } from "./Entity.js";
import { EnemyArchetype, GameState } from "./GameState.js";
import { Point2d } from "./Point2d.js";
import { Soldier } from "./Soldier.js";
import { AttackSoldierAction } from "./actions/AttackSoldierAction.js";
import { BuildSoldierAction } from "./actions/BuildSoldierAction.js";
import { HealAction } from "./actions/HealAction.js";
import { SettleAction } from "./actions/SettleAction.js";
import { TargetMoveAction } from "./actions/TargetMoveAction.js";

export function aiThink(gameState: GameState)
{
	for (const player of gameState.players)
	{
		if (player == gameState.barbarianPlayer || player == gameState.humanPlayer)
			continue;
		
		let soldierCount = 0;
		const targets: EnemyArchetype[] = [];

		// First, move all my soldiers to attack targets
		for (const soldier of gameState.entities)
		{
			if (soldier.player != player || !isArchetype(soldier, 'position', 'actionable', 'movement', 'health', 'soldier'))
				continue;
			soldierCount++;

			if (soldier.actionable.remaining < 1)
				continue;

			const inCity: Archetype<['position', 'city', 'player']> | undefined = gameState.search(soldier.position.position, 'city', 'player')
				.filter(p => p.player != player)
				.find(p => Point2d.equivalent(soldier.position.position, p.position.position));
			if (inCity)
			{
				new SettleAction(player, soldier, inCity).execute();
				continue;
			}

			const enemiesInRange = gameState.findEnemiesInRange(player, soldier.position.position, 1);
			// Find the best nearby targets to attack
			let targetCity: City | null = null, targetSoldier: Soldier | null = null, targetEntity: Archetype<['position']> | null = null;
			for (const target of enemiesInRange)
			{
				if (targets.includes(target))
					continue;
				if (target.city)
				{
					if (gameState.search(target.position.position, 'soldier').length == 0)
					{
						targetCity = target.city;
						targetEntity = target;
					}
				}
				else if (target.soldier)
				{
					if (targetSoldier == null || ((targetEntity?.health?.remaining ?? 1) < (targetEntity?.health?.amount ?? 1)))
					{
						targetSoldier = target.soldier;
						targetEntity = target;
					}
				}
			}
			if (targetCity != null && targetEntity)
			{
				const path = navigateNear(gameState, soldier.position.position, targetEntity.position.position);
				if (path)
					new TargetMoveAction(soldier, path).execute(gameState.entities);
			}
			else if (targetSoldier != null && targetEntity)
				new AttackSoldierAction(soldier, targetEntity as Archetype<['position', 'health']>, gameState).execute(gameState.entities);
			else if ((targetEntity?.health?.remaining ?? 1) < (targetEntity?.health?.amount ?? 1))
				new HealAction(soldier).execute(gameState.entities);
			else
			{
				const target = gameState.findNearestEnemyTarget(player, soldier.position.position, targets);
				if (target)
				{
					const path = navigateNear(gameState, soldier.position.position, target.position.position);
					if (path)
						new TargetMoveAction(soldier, path).execute(gameState.entities);
				}
			}
		}

		for (const city of gameState.entities.filter((e: Entity): e is Archetype<['player', 'position', 'actionable', 'city']> => isArchetype(e, 'player', 'position', 'actionable', 'city')))
		{
			if (city.player != player)
				continue;

			if (city.actionable.remaining < 1)
				continue;

			if (soldierCount < 3 && gameState.search(city.position.position, 'soldier').length == 0)
				new BuildSoldierAction(gameState, player, city).execute(gameState.entities);
		}
	}
}