export class HealAction {
    selection;
    constructor(selection) {
        this.selection = selection;
    }
    execute(entities) {
        this.selection.health.remaining = Math.min(this.selection.health.amount, Math.floor(this.selection.health.remaining + this.selection.health.amount * 0.4));
        if (this.selection.actionable)
            this.selection.actionable.remaining = 0;
    }
}
