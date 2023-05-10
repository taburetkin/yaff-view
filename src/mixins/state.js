export const stateMixin = {
	
	stateEnabled: true,

	state (arg1, arg2, arg3) {
		if (arguments.length === 1 && typeof arg1 !== 'object') {
			return this._getState(arg1);
		}
		return this._setState.apply(this, arguments);
	},

	textState(key) {
		let value = this.state(key);
		if (value === true) {
			value = key;
		} else if (value === false || value == null) {
			value = '';
		}
		return value;
	},

	_initializeState () {
		if (this._state) { return; }
		this._state = {};

		const state = this.get('initialState');

		if (state && typeof state === 'object') {
			this.state(state);
		}

	},

	_getState (key) {
		this._initializeState();
		return this._state[key];
	},
	_setState (arg1, arg2, arg3) {
		let hash;
		let options;

		if (typeof arg1 !== 'object') {
			hash = { [arg1]: arg2 };
			options = arg3;
		} else {
			hash = arg1;
			options = arg2;
		}

		const { silent } = (options || {});

		this._initializeState();

		const state = this._state;
		const changes = {};
		for (const key in hash) {
			const currentValue = state[key];
			const value = hash[key];

			if (currentValue === value) { continue; }
			changes[key] = value;
			state[key] = value;
			if (!silent) {
				this.triggerMethod('state:' + key, value);
			}
		}

		if (!silent) {
			this.triggerMethod('state', changes);
		}
	}
}