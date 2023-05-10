import { attachView } from "../utils/attachView.js";

export const regionsMixin = {
	regionShow(name, view, showOptions = {}) {
		
		if (view.isDestroyed()) {
			throw new Error(`${this}: region \`${name}\`: Unable show view because it is destroyed`);
		}

		const region = this.getRegion(name);
		const currentView = this.getRegionView(name);
			// this._children.getView(region.name, 'region');
		if (currentView) {
			currentView.destroy();
		}

		const el = this.$(region.selector);
		if (!el)  {
			throw new Error(`${this}: region \`${name}\`: element not found by given selector \`${region.selector}\``);
		}

		this._initializeChildrenContainer();

		let attach = 'replaceContent';
		let replacedEl;
		let replaceElement = 'replaceElement' in showOptions ? showOptions.replaceElement : region.replaceElement;
		if (replaceElement) {
			attach = 'replace';
			replacedEl = el;
		}

		const context = this._buildContext('region', { 
			region: region.name,
			view: view,
			replacedEl
		})

		this._children.add(context);
		this._setupChild(view);
		attachView(view, { el, attach });

	},
	
	getRegion(name) {
		this._initializeRegions();
		const region = this._regions[name];
		if (!region) {
			throw new Error(`(${this.name}|${this.cid}): region \`${name}\` not found`);
		}
		if (!region.selector) { 
			throw new Error(`(${this.name}|${this.cid}): region \`${name}\` has no defined selector`);
		}
		return region;
	},

	getRegionView(name) {
		if (!this._children) {
			return;
		}
		return this._children.getView(name, 'region');
	},

	_initializeRegions() {
		if (this._regions) { return; }
		const regions = this.get('regions') || {};
		const compiled = {};
		for(let name in regions) {
			compiled[name] = this._normalizeRegion(name, regions[name]);
		}
		this._regions = compiled;
	},

	_normalizeRegion(name, arg) {
		if (!arg) { return; }
		const type = typeof arg;
		if (type === 'string') {
			return {
				name,
				selector: arg
			}
		} else if (type === 'object') {
			return Object.assign({}, arg, { name })
		}
	}

}