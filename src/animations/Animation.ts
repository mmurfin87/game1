import { Camera } from "../Camera.js";
import { Point2d } from "../Point2d.js";

export class AnimationStep
{
	constructor(
		public readonly position: Point2d,
		public readonly spriteIndex: number,
		public readonly complete: boolean
	)
	{}
}

export interface Animation
{
	evaluateAnimationStep(currentTime: number, camera: Camera): AnimationStep;
}