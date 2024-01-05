import { Archetype, Entity } from "../Entity.js";
import { Point2d } from "../Point2d.js";
import { Movement } from "../components/Movement.js";
import { Action } from "./Action.js";

export class TargetMoveAction implements Action
{
	constructor(
		private readonly selection: Archetype<['movement']>,
		private readonly path: Point2d[]
	)
	{}

	execute(entities: Entity[]): void
	{
		this.selection.movement.path = this.path;
		this.selection.movement.stepStart = null;
		this.selection.movement.wait = false;
	}
}