import { Point2d } from "../Point2d.js";
import { Animation } from "../animations/Animation.js";

export class Renderable
{
	constructor(
		public image: 'soldier' | 'city' | 'grassland' | 'forest' | 'mountains' | 'water',
		public color: string,
		public animation: Animation | null
	)
	{}
}