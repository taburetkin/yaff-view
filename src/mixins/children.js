import { invokeValue } from "../utils/core.js";
import { attachView } from "../utils/attachView.js";
import { isView } from "../utils/is-utils.js";
import { uniqueId } from "../core.js";
import { ChildrenContainer } from "../ChildrenContainer.js";
import { getConfigurationValue } from "../configuration.js";

export const childrenMixin = {

	childrenEnabled: undefined,

	_renderChildren(children) {
		if (children == null || typeof children !== 'object') return;
		
		const isArray = Array.isArray(children);
		const iterateArray = isArray ? children : Object.keys(children);
		const renderOptions = this._getRenderChildrenOptions({ 
			isArray,
			containerKey: 'childrenContainer', 
			childViewKey: 'childView' 
		});
		for (let key in iterateArray) {
			if (!isArray) { key = iterateArray[key]; }
			let child = children[key];
			if (child == null) { continue; }
			const name = isArray ? undefined : key;
			const index = isArray ? parseInt(key, 10) : undefined;
			this._renderChild(child, { name, index }, renderOptions);
			
		}		
	},

	getChildren() {
		return this.get('children');
	},

	_getChildren() {
		const enabled = getConfigurationValue('view.render.children', this.get('childrenEnabled'));
		if (!enabled) { return; }
		const children = this.getChildren();
		if (children && typeof children === 'object' && ((Array.isArray(children) && children.length) || Object.keys(children).length > 0)) {
			return children;
		}
	},

	_initializeChildrenContainer() {
		if (this._children) { return; }
		this._children = new ChildrenContainer(this);
	},	



	_getViewsContainer(key) {
		const selector = this.get(key);
		if (selector == null) {
			return;
		}
		
		const el =  this.$(selector);
		if (el == null) {
			throw new Error('children container not found: ' + selector);
		}
		return el;
	},

	_getRenderChildrenOptions(options, ext) {
		const opts = this.get('renderChildrenOptions')

		const defaultOptions = this.get('defaultChildViewOptions');
		const childOptions = this.get(options.childViewKey + 'Options');
			// this.get('childViewOptions');

		Object.assign(options, opts, {
			childrenContainer: this._getViewsContainer(options.containerKey) || this.el,
			childView: this.get(options.childViewKey),
			defaultOptions,
			options: childOptions
		}, ext);
		return options;
	},
	renderChild(child, _renderOptions = {}) {
		const renderOptions = this._getRenderChildrenOptions({ 
			containerKey: 'childrenContainer', 
			childViewKey: 'childView',
		}, _renderOptions);
		this._renderChild(child, undefined, renderOptions);
	},
	_renderChild(viewArg, viewOptions = {}, renderOptions) {
		let view = invokeValue(viewArg, this, this);
		if (view == null) { return; }

		let alreadyBuildedView = isView(view);
		let viewName;

		if (!alreadyBuildedView) {
			viewName = view.name || viewOptions.name;
		}

		let exist;
		let existView;

		if (viewName) {
			exist = this._children.get(viewName, 'name');
			if (exist && exist.view && !exist.view.isDestroyed()) {
				existView = exist.view;
			}
		}

		view = existView || this._buildChild(view, viewOptions, renderOptions);
		if (view == null) { return; }

		const compName = view.get('name');
		const replacedEl = compName ? this.$(compName) : undefined;
		if (!exist) {
			const removeBehavior = (compName ? view.get('removeBehavior') : undefined) || 'destroy';
			const context = this._buildContext('child', { replacedEl, view, name: compName,  removeBehavior });
			this._children.add(context);
		} else {
			exist.replacedEl = replacedEl;
			this._children.attach(exist);
		}

		const options = {
			el: replacedEl || renderOptions.childrenContainer,
			attach: replacedEl ? 'replace' : (view.get('attachMethod') || renderOptions.attach),
			attachIndex: view.get('attachIndex'),
			triggerAttach: this.isAttached()
		};

		if (options.attachIndex != null) {
			console.log('index detected');
		}

		attachView(view, options);

	},


	_buildContext(type, contextOptions) {
		return Object.assign({ id: uniqueId('ctx'), type }, contextOptions);
	},

	_buildChild(child, defOptions = {}, renderOptions) {

		if (child == null || isView(child)) { return child; }

		let Ctor;

		if (typeof child === 'function') {
			Ctor = child;
			child = undefined;
		} else {
			Ctor = child.class || renderOptions.childView;
		}
		
		if (!Ctor) {
			throw new Error(`(${this.name}|${this.cid}): render children: unable to build child view, constructor not found`);
		}

		const options = Object.assign(defOptions, renderOptions.defaultOptions, child, renderOptions.options);
		delete options.class;

		const view = new Ctor(options);

		this._setupChild(view);

		return view;
	},

	_setupChild(view) {

		view.triggerMethod('setup', view, this);
		this._handleChildEvents(view);
		
	},

	_handleChildEvents(view) {
		
		if (this._childViewEvents === undefined) {
			this._childViewEvents = this.get('childViewEvents') || null;
		}
		if (this._childViewTriggers === undefined) {
			this._childViewTriggers = this.get('childViewTriggers') || null;
		}
		
		if (!(this._childViewEvents || this._childViewTriggers)) { return; }

		this.listenTo(view, 'all', (event, ...args) => {
			if (this._childViewTriggers) {
				const triggerEvent = this._childViewTriggers[event];
				if (triggerEvent) {
					this.triggerMethod(triggerEvent, ...args);
				}
			}

			if (this._childViewEvents) {
				
				let handler = this._childViewEvents[event];
				if (handler == null) { return; }
				const handlerName = handler;
				if (typeof handler === 'string') {
					handler = this[handler];
				}
				if (typeof handler === 'function') {
					handler.call(this, ...args);
				} else {
					throw new Error(`Unable to proxy child view event - handler is not a function. [${event}]:${handlerName}`)
				}
			}
		});

	},

	// _removeChildren() {
	// 	for(let ctx of this._children.children.values()) {
	// 		ctx.view?.destroy();
	// 	}
	// }

}