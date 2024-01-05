export class TargetMoveAction {
    selection;
    path;
    constructor(selection, path) {
        this.selection = selection;
        this.path = path;
    }
    execute(entities) {
        this.selection.movement.path = this.path;
        this.selection.movement.stepStart = null;
        this.selection.movement.wait = false;
    }
}
