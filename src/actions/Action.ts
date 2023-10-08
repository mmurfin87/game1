export interface Action<T>
{
    name(): string;
    recipe(): (keyof T)[];
    prepare(data: T): void;
    execute(): void;
}

export abstract class PreparedAction implements Action<{}>
{
    constructor(private readonly actionName: string) {}
    
    name(): string
    {
        return this.actionName;
    }

    recipe(): (keyof {})[]
    {
        return [];
    }

    prepare(data: {}): void
    {
        
    }

    abstract execute(): void;
}

export abstract class AbstractAction<T extends Object> implements Action<T>
{
    protected data: T;

    constructor(
        private readonly actionName: string,
        private readonly nullObject: T
    )
    {
        this.data = nullObject;
    }
    
    name(): string
    {
        return this.actionName;
    }

    recipe(): (keyof T)[]
    {
        return Object.keys(this.nullObject) as (keyof T)[];
    }

    prepare(data: T): void
    {
        this.data = data;
    }

    abstract execute(): void;
}