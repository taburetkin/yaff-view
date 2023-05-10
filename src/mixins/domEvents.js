import { getDefaultValueFromConfig } from "../configuration";

const delegateEventSplitter = /^(\S+)\s*(.*)$/;

export const domEventsMixin = {

	// for dom events. hardly used in jquery, but not necessary
	delegateEventNamespace: 'delegateEvents',


	undelegateEvents() {
		const eventNamespace = this.delegateEventNamespace + this.cid;
		this.dom.events.off(this.el, eventNamespace);
	},

	delegateEvents(events, merge) {
		if (arguments.length === 0) {
			const _evs = this.get('events');
			const _trigs = this._getTriggers();
			events = Object.assign({}, _evs, _trigs);
		}
		if (!events) return this;

		if (!merge) {
			this.undelegateEvents();
		}

		for (let key in events) {
			let method = events[key];
			const match = key.match(delegateEventSplitter);
			this.delegate(match[1], match[2], method);
		}

		return this;
	},

	_getTriggers() {

		const raw = this.get('triggers');
		if (typeof raw !== 'object') {
			return;
		}

		const triggers = {};
		for(let event in raw) {
			const handler = buildTriggerHandler(this, raw[event]);
			if (handler) {
				triggers[event] = handler;
			}
		}

		return triggers;
  },

	delegate(eventName, selector, method) {
		if (arguments.length === 2) {
			method = selector;
			const match = eventName.match(delegateEventSplitter);
			eventName = match[1];
			selector = match[2];
		}
		if (method == null) { new Error('wrong use of .delegate(), method was not provided'); }
		if (typeof method !== 'function') method = this[method];
		if (!method) { return; };

		const eventNamespace = this.delegateEventNamespace + this.cid;
		this.dom.events.on(this.el, eventName, eventNamespace, selector, method.bind(this));
		return this;
	},
	
}


function buildTriggerHandler(view, triggerDef) {
  if (typeof triggerDef === 'string') {
    triggerDef = { event: triggerDef };
  }
  const eventName = triggerDef.event;

  let shouldPreventDefault = getDefaultValueFromConfig('view.triggers.preventDefault', triggerDef.preventDefault);
	
  let shouldStopPropagation = getDefaultValueFromConfig('view.triggers.stopPropagation', triggerDef.stopPropagation);

	return function(event, ...args) {

		if (shouldPreventDefault) {
      event.preventDefault();
    }
    if (shouldStopPropagation) {
      event.stopPropagation();
    }

    view.triggerMethod(eventName, view, event, ...args);
  };
}