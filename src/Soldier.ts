class Soldier
{
	readonly type: string = "Soldier";
	target: { row: number; col: number } | null = null;
	private moveStartTime: number | null = null;

	constructor(
		public row: number, 
		public col: number, 
		public player: Player,
		public speed: number)
	{
	}

	moveTo(targetRow: number, targetCol: number): void {
		this.target = { row: targetRow, col: targetCol };
		console.log(`Moving (${this.row},${this.col}) to (${this.target.row},${this.target.col})`);
	}

	update(currentTime: number) {
		if (!this.target)
			return; // No target to move to
		else
		{
			if (this.moveStartTime == null)
				this.moveStartTime = currentTime - this.speed;

			if (this.row == this.target.row && this.col == this.target.col)
			{
				this.target = null;
				this.moveStartTime = null;
				console.log(`Arrived (${this.row},${this.col})`);
			}
			else if (currentTime - this.moveStartTime >= this.speed)
			{
				const x = this.target.row - this.row, y = this.target.col - this.col;
				const distance = Math.sqrt(x * x + y * y);
				const ux = Math.round(x / distance),  uy = Math.round(y / distance);
				console.log(`Moving (${this.row},${this.col}) by (${ux},${uy})`)
				this.row += ux;
				this.col += uy;
				this.moveStartTime = currentTime;
			}
		}
	}
}