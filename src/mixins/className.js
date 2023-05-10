import { invokeValue } from "../utils/core.js";

export const classNameMixin = {

	initializeStateClassNames() {
		if (this._stateClassNamesInitialized || !this.get('stateEnabled')) { return; }
		this._stateClassNamesInitialized = true;

		const states = this._getStateClassNames();
		if (!states) { return; }

		this.on('state', (changedStates) => {
			if (states.some(state => state in changedStates)) {
				this.updateClassName();
			}
		});

	},


	getClassName() {

		const hash = this._buildClassNameHash();
		const className = Object.keys(hash).join(' ');
		return className;

	},

	updateClassName(stack) {
		const className = this.getClassName();
		this.dom.setAttribute(this.el, 'class', className);
	},

	addClassName(cls) {
		if (!this._runtimeClassNames) {
			this._runtimeClassNames = {};
		}
		this._runtimeClassNames[cls] = 1;
		if (this.isRendered()) {
			this.$el.addClass(cls);
		}
	},

	removeClassName(cls) {
		if (!this._runtimeExcludeClassNames) {
			this._runtimeExcludeClassNames = {};
		}
		this._runtimeExcludeClassNames[cls] = 1;
		if (this.isRendered()) {
			this.$el.removeClass(cls);
		}
	},







	_buildClassNameHash() {
		const hash = {};

		addHashValues(hash, this.get('className'), val => invokeValue(val, this, this));
		addHashValues(hash, this.get('thisClassName'), val => invokeValue(val, this, this));
		addHashValues(hash, this._getStateClassNamesValues());
		addHashValues(hash, this._runtimeClassNames);
		removeHashValues(hash, this._runtimeExcludeClassNames);

		return hash;
	},

	_getStateClassNames() {
		const keys = this.get('stateClassNames');
		if (Array.isArray(keys)) { return keys; }
	},

	_getStateClassNamesValues() {
		const keys = this._getStateClassNames();
		if (!keys) { return; }
		return keys.map(key => this.textState(key));
	},

}

function addHashValues(hash, values, invoke) {
	if (values == null) { return; }
	if (typeof values !== 'object') { return addHashValue(hash, values, invoke); }
	const arr = Array.isArray(values) ? values : Object.keys(values);
	return arr.reduce((memo, val) => addHashValue(memo, val, invoke), hash);
}

function addHashValue(hash, value, invoke) {
	if (invoke) { value = invoke(value); }
	if (value == null || value === '') { return hash; }
	hash[value] = 1;
	return hash;
}

function removeHashValue(hash, value) {
	if (value == null || value === '') { return hash; }
	delete hash[value];
	return hash;
}

function removeHashValues(hash, values) {
	if (values == null || typeof values !== 'object') { return; }
	const arr = Array.isArray(values) ? values : Object.keys(values);
	return arr.reduce(removeHashValue, hash);
}

