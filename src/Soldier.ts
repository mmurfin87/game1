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
		const collision = gameState.search(target).find(Soldier.isType);						
		if (collision)
			return logReturn(false, `Collision: (${target.x},${target.y}) already occupied.`, this, 'will collide with', collision);
		//{
		//	console.log("Collision:", target, "already occupied by", collision);
		//	return false;
		//}
		this.col = target.x;
		this.row = target.y;
		return true;
	}

	destination(): Point2d | null
	{
		return this.path && this.path.length > 1 ? this.path[1] : null;
	}

	moveCompletionPercent(currentTime: number): number
	{
		return this.movesLeft > 0 && this.moveStartTime ? (currentTime - this.moveStartTime) / moveTime : 0.0;
	}

	/**
	 * The path must always start at the soldier's current position
	 * @param path 
	 * @returns 
	 */
	move(path: Point2d[]): boolean
	{
		if (path.length < 2)
		{
			console.log(`path is too short:`, path.length);
			return false;
		}
		if (!Point2d.equivalent(this.locate(), path[0]))
		{
			console.log("path must start at origin", this.locate(), "but found", path[0]);
			return false;
		}
		this.path = path;
		console.log(`Moving (${this.row},${this.col}) to ${this.path[this.path.length-1]}`);
		return true;
	}

	stop(): void
	{
		this.path = null;
		this.moveStartTime = null;
	}

	update(gameState: GameState): void
	{
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
		else if (this.moveStartTime == null)
		{
			const nextCollision = gameState.search(this.path[1]).find(Soldier.isType);
			if (nextCollision)
			{
				console.log("Will collide at:", this.path[1], "already occupied by", nextCollision);
				this.stop();
			}
			else
				this.moveStartTime = gameState.currentTime;
		}
		else if (this.moveStartTime != null && gameState.currentTime - this.moveStartTime >= moveTime)
		{
			let i = 1;
			if (i < this.path.length)
			{
				const steps = this.locate().stepsTo(this.path[i]);
				if (steps <= this.movesLeft)
				{
					if (!this.position(gameState, this.path[i]))
					{
						this.stop();
						return;
					}
					this.movesLeft -= steps;
					this.moveStartTime = gameState.currentTime;
					this.path.shift();
				}

				if (this.path.length < 2)
					this.stop();
				else
				{
					const nextCollision = gameState.search(this.path[1]).find(Soldier.isType);
					if (nextCollision)
					{
						console.log("Will collide at:", this.path[1], "already occupied by", nextCollision);
						this.stop();
					}
				}
			}
			else
				this.stop();
		}
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