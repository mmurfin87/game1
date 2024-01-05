import { AnimationStep } from "./Animation.js";
export class AttackAnimation {
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
        const dv = this.target.clone().subtract(this.origin).unit();
        if (stepCompletion < 0.75)
            dv.scale(stepCompletion * distance);
        else {
            dv.scale(0.75 * distance);
        }
        return new AnimationStep(this.origin.clone().add(dv), 0, stepCompletion >= 1.0);
    }
}
