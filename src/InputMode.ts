export interface InputHandler
{
    keybaordEvent(event: KeyboardEvent): void;

    mouseEvent(event: MouseEvent): void;
}