import { Camera } from "../Camera.js";
import { Point2d } from "../Point2d.js";
import { Animation, AnimationStep } from "./Animation.js";

export class AttackAnimation implements Animation
{
	constructor(
		public readonly startTime: number,
		public readonly duration: number,
		public readonly origin: Point2d,
		public readonly target: Point2d
	)
	{}

	evaluateAnimationStep(currentTime: number, camera: Camera): AnimationStep
	{
		const stepCompletion = (currentTime - this.startTime) / this.duration;
		
		const distance = this.origin.distanceTo(this.target);
		const dv = this.target.clone().subtract(this.origin).unit();
		if (stepCompletion < 0.75)
			dv.scale(stepCompletion * distance);
		else
		{
			dv.scale(0.75 * distance);
		}
		
		return new AnimationStep(this.origin.clone().add(dv), 0, stepCompletion >= 1.0);
	}
}