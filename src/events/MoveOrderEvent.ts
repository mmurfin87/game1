import { Point2d } from "../Point2d";

export class MoveOrderEvent
{
	static readonly name = 'MoveOrder';

	public readonly name = MoveOrderEvent.name;

	constructor(
		public readonly id: BigInt,
		public readonly path: Point2d[]
	)
	{}
}