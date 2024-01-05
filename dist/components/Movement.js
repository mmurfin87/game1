export class Movement {
    path;
    stepStart;
    stepDuration;
    wait;
    constructor(path, stepStart, stepDuration, wait) {
        this.path = path;
        this.stepStart = stepStart;
        this.stepDuration = stepDuration;
        this.wait = wait;
    }
}
