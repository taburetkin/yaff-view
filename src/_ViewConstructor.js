import { knownCtors, extend } from "./core.js";
import { ChildrenContainer } from "./ChildrenContainer.js";
import { uniqueId } from './core.js';

const invokablePropertyKeys = ['model', 'collection', 'el', 'id']
const propertyKeys = ['template', 'modelComparator', 'modelFilter']

const View = function(options) {

	this.cid = uniqueId(this.cidPrefix);
	this.options = Object.assign({}, options);

	this._setProperties(invokablePropertyKeys);
	this._setProperties(propertyKeys, false);

	// if (this.get('supportsChildren')) {
	// 	this._children = new ChildrenContainer(this);
	// }

	this.preinitialize.apply(this, arguments);

	// domElementMixin
	this._initializeElement();

	
	this.initialize.apply(this, arguments);
	
	this.initializeMixins();

	this.delegateEntityEvents();
	// domElementMixin
	this.updateElement();

	if (this.get('triggerInitializeEnabled') !== false) {
		this.triggerMethod('initialize', this);
	}

}

View.extend = extend;

knownCtors.push(View);


// constructor separated from definition to avoid circular reference in View -> mixins -> utils -> View  import cycle.
export {
	View
}