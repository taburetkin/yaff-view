export const renderMixin = {

	passModelToTemplate: true,
	passCollectionToTemplate: false,
	triggerTemplateRenderEnabled: false,
	passCollectionToTemplate: false,
	passModelToTemplate: true,
	collectionTemplateKey: 'models',

	isRendered() {
		return this._isRendered === true;
	},

	isAttached() {
		return this._isAttached === true;
	},

	detach() {		
		this.dom.detachElement(this.el);
		this._isAttached = false;
	},

	render() {
		if (this._isDestroyed) { return this; }

		const childrenInitialized = !!this._children;

		
		if (childrenInitialized) {
			this._children.beforeParentRender();
		}
		
		this.triggerMethod('before:render', this);
		
		this.beforeRender();

		// true for prerendered views
		const shouldSkipChildren = this.renderTemplate();

		if (this.get('triggerTemplateRenderEnabled') === true) {
			this.triggerMethod('template:render', this, shouldSkipChildren);
		}

		if (!shouldSkipChildren) { 
			const skipClear = true;
			this.renderChildren(skipClear);
		}

		this.afterRender();

		this._isRendered = true;
		this.triggerMethod('render', this);
	},
	
	beforeRender() { },

	renderChildren(skipClear, collectionChanges) {

		if (!skipClear) {
			this._children.beforeParentRender();
		}
		
		const children = this._getChildren();
		const models = this._getCollectionOrderedModels();
		// console.log('?>',this.toString(), children, models);

		if (!(children || models)) {
			return;
		}

		this._initializeChildrenContainer();

		this.triggerMethod('before:children:render', this);

		this._renderCollection(collectionChanges, models);

		this._renderChildren(children);

		this.triggerMethod('children:render', this);

	},

	afterRender () { },
	
	renderTemplate() {
		const template = this.getTemplate();
		if (!template) { return template === false; }
		const templateContext = this.getTemplateContext();
		try {
			this.dom.render(this.el, template, templateContext);
		} catch(exc) {
			console.warn(this + ': template internal exception');
			throw exc;
		}
	},

	getTemplate() {
		
		if (this.template == null || this.template === false || this.template === '' || typeof this.template === 'function') {
			return this.template;
		}
		this.template = this.dom.buildTemplate(this.template);
		return this.template;
	},

	getTemplateContext() {
		const templateContext = this.get('templateContext');
		const context = this._mixTemplateData(templateContext);
		return context;
	},

	_mixTemplateData(context) {
		let modelData;
		let collectionData;

		if (this.model && this.get('passModelToTemplate')) { 
			modelData = this.getTemplateModelData();
		}

		if (this.collection && this.get('passCollectionToTemplate')) {
			const key = this.get('collectionTemplateKey') || 'models';
			collectionData = this.getTemplateCollectionData(key);
		}

		return this.mixTemplateData(context, modelData, collectionData);

	},

	mixTemplateData(context, modelData, collectionData) {
		return Object.assign({}, modelData, collectionData, context);
	},

	getTemplateModelData() {
		return this.model.toJSON();
	},

	getTemplateCollectionData(key) {
		const value = this.collection.toJSON();
		return { [key]: value };
	},

}