import { Point2d } from "../Point2d";

export class NewSoldierEvent
{
	static readonly name = 'NewSoldier';

	public readonly name = NewSoldierEvent.name;

	constructor(
		public readonly id: bigint,
		public readonly position: Point2d,
		public readonly moves: number
	)
	{}
}