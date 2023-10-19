import { Player } from "./Player.js";
import { Point2d } from "./Point2d.js";

export class Soldier
{
	public readonly type = "Soldier";
	public path: Point2d[] | null = null;
	private moveStartTurn: number | null = null;
	private moveStartTime: number | null = null;

	constructor(
		public row: number, 
		public col: number, 
		public player: Player,
		public moves: number,
		public health: number,
		public movesLeft: number = moves)
	{
	}

	position(): Point2d
	{
		return new Point2d(this.col, this.row);
	}

	move(currentTurn: number, currentTime: number, path: Point2d[]): boolean
	{
		if (path.length < 2)
		{
			console.log(`path is too short: ${path.length}`);
			return false;
		}
		if (path[0].x != this.col || path[0].y != this.row)
		{
			console.log(`path must begin at current location ${this.position()} but was given as ${path[0]}`);
			return false;
		}
		this.path = path;
		this.moveStartTurn = currentTurn;
		this.moveStartTime = currentTime - 500;
		console.log(`Moving (${this.row},${this.col}) to ${this.path[this.path.length-1]}`);
		this.followPathWhileAble(currentTime);
		return true;
	}

	moveTo(currentTurn: number, currentTime: number, target: Point2d): boolean {
		return this.move(currentTurn, currentTime, [this.position(), target]);
	}

	stop(): void
	{
		this.path = null;
		this.moveStartTime = null;
		this.moveStartTurn = null;
	}

	update(currentTurn: number, currentTime: number): void
	{
		if (currentTurn === this.moveStartTurn)
			this.animateMove(currentTime);
	}

	nextTurn(currentTurn: number, currentTime: number): void
	{
		this.animateMove(currentTime);
	}

	private followPathWhileAble(currentTime: number): void
	{
		if (this.path == null)
			return;
		let i = 1;
		if (i < this.path.length)
		{
			const steps = this.path[i-1].stepsTo(this.path[i]);
			if (steps <= this.movesLeft)
			{
				this.col = this.path[i].x;
				this.row = this.path[i].y;
				this.movesLeft -= steps;
				this.moveStartTime = currentTime;
				this.path.shift();
			}
		}
		else
			this.stop();
	}

	private animateMove(currentTime: number): void
	{
		if (!this.path)
			return; // No target to move to
		else
		{			
			if (this.row == this.path[this.path.length-1].y && this.col == this.path[this.path.length-1].x)
			{
				this.path = null;
				this.moveStartTime = null;
				console.log(`Arrived (${this.row},${this.col})`);
			}
			else if (this.moveStartTime != null && currentTime - this.moveStartTime >= 500)
			{
				this.followPathWhileAble(currentTime);
			}
		}
	}
}