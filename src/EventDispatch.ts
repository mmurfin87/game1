export type EventListener<T> = (event: T) => void;

//export type EventTypeChecker<T> = (event: any) => event is T;

export interface EventDispatch
{
	dispatch(event: any): void;
	bind<T>(name: string, listener: EventListener<T>): void;
	unbind(name: string, listener: EventListener<any>): void;
}

export class SimpleEventDispatch implements EventDispatch
{
	private listeners: Map<string, EventListener<any>[]> = new Map();

	dispatch(event: any): void
	{
		this.listeners.get(event.name)?.forEach(listener => listener(event));
	}
	
	bind<T>(name: string, listener: EventListener<T>): void
	{
		let listenerList = this.listeners.get(name);
		if (!listenerList)
		{
			listenerList = [];
			this.listeners.set(name, listenerList);
		}
		listenerList.push(listener);
	}

	unbind(name: string, listener: EventListener<any>): void
	{
		const listenerList = this.listeners.get(name);
		if (listenerList)
		{
			const index = listenerList.indexOf(listener)
			if (index)
				listenerList.splice(index, 1);
		}
	}
}