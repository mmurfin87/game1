import { GameState } from "./GameState.js";
import { Player } from "./Player.js";
import { Point2d } from "./Point2d.js";

const moveTime = 500;

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
		public movesLeft: number = moves,
		public healthLeft: number = health)
	{
	}

	locate(): Point2d
	{
		return new Point2d(this.col, this.row);
	}

	position(gameState: GameState, target: Point2d): boolean
	{
		let tile = gameState.tileAtCoords(this.col, this.row);
		tile.occupant = null;
		
		tile = gameState.tileAtCoords(target.x, target.y);
		if (tile.occupant != null)
			return false;
		tile.occupant = this;

		this.col = target.x;
		this.row = target.y;
		return true;
	}

	destination(): Point2d | null
	{
		return this.path && this.path.length > 0 ? this.path[0] : null;
	}

	moveCompletionPercent(currentTime: number): number
	{
		return this.movesLeft > 0 && this.moveStartTime ? (currentTime - this.moveStartTime) / moveTime : 0.0;
	}

	move(currentTurn: number, currentTime: number, path: Point2d[]): boolean
	{
		if (path.length < 1)
		{
			console.log(`path is too short: ${path.length}`);
			return false;
		}
		this.path = path;
		this.moveStartTurn = currentTurn;
		this.moveStartTime = currentTime;
		console.log(`Moving (${this.row},${this.col}) to ${this.path[this.path.length-1]}`);
		return true;
	}

	moveTo(currentTurn: number, currentTime: number, target: Point2d): boolean {
		return this.move(currentTurn, currentTime, [this.locate(), target]);
	}

	stop(): void
	{
		this.path = null;
		this.moveStartTime = null;
		this.moveStartTurn = null;
		console.log(`Arrived (${this.row},${this.col})`);
	}

	update(gameState: GameState): void
	{
		//if (currentTurn === this.moveStartTurn)
			this.followPathWhileAble(gameState);
	}

	nextTurn(gameState: GameState): void
	{
		if (this.path && this.moveStartTime && this.moveStartTime >= 500)
			this.moveStartTime = gameState.currentTime;
		this.followPathWhileAble(gameState);
	}

	private followPathWhileAble(gameState: GameState): void
	{
		if (this.path == null)
			return;
		else if (this.moveStartTime != null && gameState.currentTime - this.moveStartTime >= moveTime)
		{
			let i = 0;
			if (i < this.path.length)
			{
				const steps = this.locate().stepsTo(this.path[i]);
				if (steps <= this.movesLeft)
				{
					if (!this.position(gameState, this.path[i]))
					{
						console.log(`Collision: (${this.path[i].x},${this.path[i].y}) already occupied by ${gameState.tileAtCoords(this.path[i].x, this.path[i].y).occupant}`);
						this.stop();
						return;
					}
					this.movesLeft -= steps;
					this.moveStartTime = gameState.currentTime;
					this.path.shift();
				}

				if (this.path.length == 0)
					this.stop();
			}
			else
				this.stop();
		}
/*
		if (this.row == this.path[this.path.length-1].y && this.col == this.path[this.path.length-1].x)
		{
			this.path = null;
			this.moveStartTime = null;
		}
		*/
	}
}