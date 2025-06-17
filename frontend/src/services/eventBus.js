const eventBus = {
  events: {},
  
  subscribe: function(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  },
  
  publish: function(event, data) {
    if (!this.events[event]) return;
    this.events[event].forEach(callback => callback(data));
  },
  
  unsubscribe: function(event, callback) {
    if (!this.events[event]) return;
    this.events[event] = this.events[event].filter(cb => cb !== callback);
  }
};

export default eventBus;