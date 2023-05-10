
import { View } from './_ViewConstructor.js';
import { domApi } from "./domApi.js";
import { 
	domElementMixin, 
	domEventsMixin, 
	optionsMixin, 
	stateMixin,
	classNameMixin, 
	renderMixin, 
	regionsMixin, 
	childrenMixin, 
	collectionMixin,
	entitiesMixin, 
} from "./mixins/index.js";

import { Events } from "./Events.js";
import { ChildrenContainer } from './ChildrenContainer.js';


Object.assign(View.prototype, 
	optionsMixin,
	Events,
	domElementMixin,
	domEventsMixin,
	classNameMixin,
	stateMixin,
	renderMixin,
	regionsMixin,
	childrenMixin,
	collectionMixin,
	entitiesMixin,
	{
		dom: domApi,
		cidPrefix: 'v',
		tagName: 'div',
		supportsChildren: true,
	
		toString() {
			return (this.get('name') || 'View') + '.' + this.cid + '(' + this.getClassName() + ')';
		},

		_setProperties(keys, invoke) {
			const options = { invoke, ignoreUndefined: 1 };
			const hash = this.get(keys, options);
			Object.assign(this, hash);
		},
	




		preinitialize() { },
	
		initialize() { },
	
		initializeMixins() {
			this.initializeStateClassNames();
		},
	
		
		// override yaff-events to respect options
		getOnMethod(eventName, methodName) {
			if (typeof this.options[methodName] === 'function') {
				return this.options[methodName];
			}
			if (typeof this[methodName] === 'function') {
				return this[methodName];
			}
		},
	
		isDestroyed() {
			return this._isDestroyed === true;
		},
	
		destroy() {
			if (this._isDestroyed || this._isDestroying) { return; }
			this._isDestroying = true;
			this.triggerMethod('before:destroy', this);
	
			this.stopListening();
			
			if (this._children) {
				this._children.beforeParentDestroy();
			}
	
			this.detach();
			this._isDestroyed = true;

			
			this.triggerMethod('destroy', this);
			this.off();
	
	
		}
	
	});





export {
	View
}