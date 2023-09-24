class City
{
	readonly type: string = "City"
	
    constructor(
		public row: number, 
		public col: number,
		public player: Player) 
	{
    }
}