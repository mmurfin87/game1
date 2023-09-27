class Soldier
{
	readonly type: string = "Soldier";
	private target: {row: number, col: number} | null = null;
	private moveStartRealTime: number | null = null;
	private moveStartGameTime: number | null = null;

	constructor(
		public row: number, 
		public col: number, 
		public player: Player,
		public moves: number)
	{
	}

	moveTo(targetRow: number, targetCol: number): boolean {
		if (distance(this.col, this.row, targetCol, targetRow).distance > this.moves)
			return false;
		this.target = { row: targetRow, col: targetCol };
		this.moveStartRealTime = Date.now();
		console.log(`Moving (${this.row},${this.col}) to (${targetRow},${targetCol})`);
		return true;
	}

	update(currentTime: number): void {
		if (!this.target)
			return; // No target to move to
		else
		{
			if (this.moveStartGameTime == null && this.moveStartRealTime != null)
			{
				this.moveStartGameTime = currentTime - (Date.now() - this.moveStartRealTime);
				this.moveStartRealTime = null;
			}

			
			if (this.row == this.target.row && this.col == this.target.col)
			{
				this.target = null;
				this.moveStartGameTime = null;
				console.log(`Arrived (${this.row},${this.col})`);
			}
			else if (this.moveStartGameTime != null && currentTime - this.moveStartGameTime >= this.moves)
			{
				const x = this.target.row - this.row, y = this.target.col - this.col;
				const distance = Math.sqrt(x * x + y * y);
				const ux = Math.round(x / distance),  uy = Math.round(y / distance);
				console.log(`Moving (${this.row},${this.col}) by (${ux},${uy})`)
				this.row += ux;
				this.col += uy;
				this.moveStartGameTime = currentTime;
			}
		}
	}
}