export const domElementMixin = {
	_initializeElement() {
		const prerendered = !!this.el;
		const el = this.el || this.dom.createElement(this.get('tagName'));
		this.setElement(el);
		this._isPrerendered = prerendered;
	},

	setElement(element) {
		this.undelegateEvents();
		this._setElement(element);
		this.delegateEvents();
		return this;
	},

	_setElement(el) {
		this.el = el;
	},

	updateElement() {
		const attrs = this.getAttributes();
		this.setElementAttributes(attrs);
	},

	getAttributes() {
		let attrs = this.get('attributes') || {};
		const className = this.getClassName();
		if (className) {
			attrs.class = className;
		}
		const add = this.get({ tagId: 'id', tagTitle: 'title' }, { ignoreUndefined: true });
		attrs = Object.assign({}, attrs, add);
		return attrs;
	},


	setElementAttributes(attrs) {
		this.dom.setAttributes(this.el, attrs);
	},

	$(selector) {
		return this.dom.findChildElement(this.el, selector);
	}

}