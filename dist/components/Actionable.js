export class Actionable {
    actions;
    remaining;
    available;
    constructor(actions, remaining, available = true) {
        this.actions = actions;
        this.remaining = remaining;
        this.available = available;
    }
}
