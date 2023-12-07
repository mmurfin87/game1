import { City } from "../City.js";
import { Archetype, Entity } from "../Entity.js";
import { EventDispatch } from "../EventDispatch.js";
import { GameState } from "../GameState.js";
import { Player } from "../Player.js";
import { Point2d } from "../Point2d.js";
import { Soldier } from "../Soldier.js";
import { Health } from "../components/Health.js";
import { Movement } from "../components/Movement.js";
import { Position } from "../components/Position.js";
import { Renderable } from "../components/Renderable.js";
import { Action } from "./Action.js";

export class BuildSoldierAction implements Action
{
    constructor(
		private readonly gameState: GameState,
		private readonly player: Player, 
		private readonly selection: Archetype<['player', 'position', 'movement', 'health', 'city']>
	)
    {}

    execute(entities: Entity[]): void
    {
		if (this.selection.movement.movesLeft < 1)
			throw new Error("Not enough moves");
		
		entities.push(new Entity(
			Entity.newId(),
			this.player,
			new Position(this.selection.position.position.clone()),
			new Movement(null, null, 500, false, 2, 0),
			new Renderable('soldier', 'black', null),
			new Health(10, 10),
			new Soldier()
		));
		
		this.selection.movement.movesLeft = 0;
    }
}