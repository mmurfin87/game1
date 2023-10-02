import { InputHandler } from "../InputMode";
import { Positioned } from "../Positioned";

export interface ActionPreparation extends InputHandler
{
    
}

export interface Action
{
    name(): string;
    prepare(): number;
    execute(): void;
}