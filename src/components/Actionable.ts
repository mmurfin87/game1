export class Actionable
{
	constructor(
		public actions: number,
		public remaining: number,
		public available: boolean = true
	)
	{}
}