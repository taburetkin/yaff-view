export const entitiesMixin = {
	delegateEntityEvents() {
    this._delegateEntityEvents(this.model, this.collection);
    return this;
  },

  _delegateEntityEvents(model, collection) {
    if (model) {
      this._modelEvents = this.get('modelEvents');
      this.bindEvents(model, this._modelEvents);
    }

    if (collection) {
      this._collectionEvents = this.get('collectionEvents');
      this.bindEvents(collection, this._collectionEvents);
    }
  },

  // Remove any previously delegate entity events
  _undelegateEntityEvents(model, collection) {
    if (this._modelEvents) {
      this.unbindEvents(model, this._modelEvents);
      delete this._modelEvents;
    }

    if (this._collectionEvents) {
      this.unbindEvents(collection, this._collectionEvents);
      delete this._collectionEvents;
    }
  },

  // Remove cached event handlers
  _deleteEntityEventHandlers() {
    delete this._modelEvents;
    delete this._collectionEvents;
  },

  bindEvents,

  // Enable unbinding view's events from another entity.
  unbindEvents,

}


function normalizeBindings(context, bindings) {
  if (!(bindings && typeof bindings === 'object') ) {
    throw new Error('Bindings must be an object.');    
  }

  return normalizeMethods.call(context, bindings);
}

function bindEvents(entity, bindings) {
  if (!entity || !bindings) { return this; }

  this.listenTo(entity, normalizeBindings(this, bindings));

  return this;
}

function unbindEvents(entity, bindings) {
  if (!entity) { return this; }

  if (!bindings) {
    this.stopListening(entity);
    return this;
  }

  this.stopListening(entity, normalizeBindings(this, bindings));

  return this;
}


function normalizeMethods(hash) {
  if (!hash) { return }

  return Object.keys(hash).reduce((normalizedHash, event) => {
		let method = hash[event];
		let methodName = method;
    if (typeof method !== 'function') {
      method = this[method];
    }
    if (typeof method === 'function') {
			normalizedHash[event] = method;
    } else {
			throw new Error('binding must be a function: ' + event + ' - ' + methodName)
		}
    return normalizedHash;
  }, {});
};