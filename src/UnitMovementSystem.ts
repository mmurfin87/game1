import { GameState } from "./GameState.js";
import { Soldier } from "./Soldier.js";
import { Entity, isArchetype } from "./Entity.js";


export class UnitMovementSystem
{
	private lastTurn = 0;

	update(entities: Entity[], gameState: GameState): void
	{
		for (const entity of entities)
		{
			if (isArchetype(entity, 'position', 'movement'))
				follow(entity, false, gameState);
		}
	}

	nextTurn(entities: Entity[], gameState: GameState): void
	{
		for (const entity of entities)
		{
			if (!isArchetype(entity, 'position', 'movement'))
				continue;
			if (entity.movement.movesLeft > 0)
				follow(entity, true, gameState);
			entity.movement.wait = true;
			entity.movement.movesLeft = entity.movement.moves;
		}
		this.lastTurn = gameState.currentTurn;
	}
}

function follow(entity: Entity, nextTurn: boolean, gameState: GameState): boolean
{
	if (!entity.position || !entity.movement)
		return false;
	const movement = entity.movement;

	if (movement.path == null)
		return false;
	else if (movement.movesLeft < 1)
	{
		movement.stepStart = null;
		movement.wait = true;
		return true;
	}
	else if (movement.stepStart == null)
	{
		if (movement.wait == false || nextTurn)
			movement.stepStart = gameState.currentTime;
		return true;
	}
	else if (movement.stepStart + movement.stepDuration < gameState.currentTime)
	{
		if (movement.movesLeft >= 1)
		{
			const nextCollision = gameState.search(movement.path[1]).find(Soldier.isType);
			if (nextCollision)
			{
				movement.stepStart = null;
				movement.wait = true;
				console.log(`Collision at: ${movement.path[1]}`, movement, nextCollision);
				return false;
			}
			entity.position.position = movement.path[1];
			if (entity.soldier)
			{
				entity.soldier.col = entity.position.position.x;
				entity.soldier.row = entity.position.position.y;
			}
			movement.movesLeft -= 1;
			movement.path.splice(0, 1);
			movement.stepStart = movement.movesLeft > 0 ? gameState.currentTime : null;
			if (movement.movesLeft > 0)
				movement.stepStart = gameState.currentTime;
			else
			{
				movement.stepStart = null;
				movement.wait = true;
			}
			if (movement.path.length < 2)
			{
				movement.path = null;
				movement.stepStart = null;
				return false;
			}
		}
		else
			movement.stepStart = null;
		return true;
	}
	else
		return true;
}