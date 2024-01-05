import { AnimationStep } from "./Animation.js";
export class MoveAnimation {
    startTime;
    duration;
    origin;
    target;
    constructor(startTime, duration, origin, target) {
        this.startTime = startTime;
        this.duration = duration;
        this.origin = origin;
        this.target = target;
    }
    evaluateAnimationStep(currentTime, camera) {
        const stepCompletion = (currentTime - this.startTime) / this.duration;
        const distance = this.origin.distanceTo(this.target);
        const dv = this.target.clone().subtract(this.origin).scale(stepCompletion);
        return new AnimationStep(this.origin.clone().add(dv), 0, stepCompletion >= 1.0);
    }
}
