export interface InputHandler
{
    keyboardEvent(event: KeyboardEvent): void;

    mouseEvent(event: MouseEvent): void;
}

export abstract class AbstractInputHandler implements InputHandler
{
    keyboardEvent(event: KeyboardEvent): void
    {
        
    }

    mouseEvent(event: MouseEvent): void
    {
        switch (event.type)
        {
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

    abstract click(event: MouseEvent): void;

    abstract rightClick(event: MouseEvent): void;
}
