import { City } from "../City.js";
import { Entity } from "../Entity.js";
import { EventDispatch } from "../EventDispatch.js";
import { GameState } from "../GameState.js";
import { Player } from "../Player.js";
import { Point2d } from "../Point2d.js";
import { Soldier } from "../Soldier.js";
import { Health } from "../components/Health.js";
import { Movement } from "../components/Movement.js";
import { Position } from "../components/Position.js";
import { Renderable } from "../components/Renderable.js";
import { NewSoldierEvent } from "../events/NewSoldierEvent.js";
import { Action } from "./Action.js";

export class BuildSoldierAction implements Action
{
    constructor(
		private readonly gameState: GameState,
		private readonly player: Player, 
		private readonly selection: City)
    {}

    execute(entities: Entity[]): void
    {
		if (this.selection.movesLeft < 1)
			throw new Error("Not enough moves");
		
		const id = Entity.newId();
		const soldier = new Soldier(id, this.selection.row, this.selection.col, this.player, 2, 10, 0);
		
		entities.push(new Entity(
			id,
			this.player,
			new Position(new Point2d(this.selection.col, this.selection.row)),
			new Movement(null, null, 500, false, 2, 2),
			new Renderable('soldier', 'black', null),
			new Health(10, 10),
			soldier
		));
		
		this.selection.movesLeft -= 1;
        this.gameState.soldiers.push(soldier);
    }
}