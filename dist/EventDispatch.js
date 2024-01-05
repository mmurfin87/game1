export class SimpleEventDispatch {
    listeners = new Map();
    dispatch(event) {
        this.listeners.get(event.name)?.forEach(listener => listener(event));
    }
    bind(name, listener) {
        let listenerList = this.listeners.get(name);
        if (!listenerList) {
            listenerList = [];
            this.listeners.set(name, listenerList);
        }
        listenerList.push(listener);
    }
    unbind(name, listener) {
        const listenerList = this.listeners.get(name);
        if (listenerList) {
            const index = listenerList.indexOf(listener);
            if (index)
                listenerList.splice(index, 1);
        }
    }
}
