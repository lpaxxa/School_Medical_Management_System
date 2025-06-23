const eventBus = {
  listeners: {},
  
  subscribe(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
    return () => this.unsubscribe(event, callback);
  },
  
  unsubscribe(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }
  },
  
  emit(event, ...args) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(callback => {
        callback(...args);
      });
    }
  }
};

export default eventBus;