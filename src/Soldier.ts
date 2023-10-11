import { Player } from "./Player.js";
import { Point2d } from "./Point2d.js";

export class Soldier
{
	public readonly type = "Soldier";
	private target: {row: number, col: number} | null = null;
	private moveStartRealTime: number | null = null;
	private moveStartGameTime: number | null = null;

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

	moveTo(target: Point2d): boolean {
		const distanceToTarget = target.stepsTo(new Point2d(this.col, this.row));
		if (distanceToTarget > this.movesLeft)
		{
			console.log("Refusing order");
			return false;
		}
		this.target = { row: target.y, col: target.x };
		this.moveStartRealTime = Date.now();
		console.log(`Moving (${this.row},${this.col}) to (${target.y},${target.x}) a distance of ${distanceToTarget}`);
		return true;
	}

	update(currentTime: number): void {
		if (!this.target)
			return; // No target to move to
		else
		{
			if (this.moveStartGameTime == null && this.moveStartRealTime != null)
			{
				this.moveStartGameTime = currentTime - 500 - (Date.now() - this.moveStartRealTime);
				this.moveStartRealTime = null;
			}

			
			if (this.row == this.target.row && this.col == this.target.col)
			{
				this.target = null;
				this.moveStartGameTime = null;
				console.log(`Arrived (${this.row},${this.col})`);
			}
			else if (this.moveStartGameTime != null && currentTime - this.moveStartGameTime >= 500)
			{
				const x = this.target.row - this.row, y = this.target.col - this.col;
				const distance = Math.sqrt(x * x + y * y);
				const ux = Math.round(x / distance),  uy = Math.round(y / distance);
				console.log(`${currentTime} (${currentTime - this.moveStartGameTime}) | Moving (${this.row},${this.col}) by (${ux},${uy})`)
				this.row += ux;
				this.col += uy;
				this.moveStartGameTime = currentTime;
			}
		}
	}
}