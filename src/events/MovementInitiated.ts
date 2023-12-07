import { Point2d } from "../Point2d";

export class UnitMovementEvent
{
	static readonly name = 'UnitMovement';

	public readonly name = UnitMovementEvent.name;

	constructor(
		public readonly id: bigint,
		public readonly origin: Point2d,
		public readonly target: Point2d,
		public readonly start: number,
		public readonly duration: number
	)
	{}
}