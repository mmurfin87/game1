export class AnimationStep {
    position;
    spriteIndex;
    complete;
    constructor(position, spriteIndex, complete) {
        this.position = position;
        this.spriteIndex = spriteIndex;
        this.complete = complete;
    }
}
