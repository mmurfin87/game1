export class AbstractInputHandler {
    keyboardEvent(event) {
    }
    mouseEvent(event) {
        switch (event.type) {
            case "click":
                this.click(event);
                break;
            case "contextmenu":
                this.rightClick(event);
                break;
            default:
                break;
        }
    }
}
