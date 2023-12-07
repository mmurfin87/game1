import { GameState } from "./GameState.js";
import { Player } from "./Player.js";
import { Point2d } from "./Point2d.js";
import { logReturn } from "./Util.js";

const moveTime = 500;

export class Soldier
{
	public readonly type = "Soldier";
	public path: Point2d[] | null = null;
	private moveStartTime: number | null = null;

	constructor(
		public id: bigint,
		public row: number, 
		public col: number, 
		public player: Player,
		public moves: number,
		public health: number,
		public movesLeft: number = moves)
	{
	}

	locate(): Point2d
	{
		return new Point2d(this.col, this.row);
	}


	static isType(value: any): value is Soldier
	{
		return value.type == "Soldier";
	}

	toString(): string
	{
		return `Soldier{player=${this.player.id}, position=(${this.col},${this.row})}`;
	}
}