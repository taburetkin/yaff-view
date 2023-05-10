import { getDefaultValueFromConfig } from "../configuration";
import { debounce } from "../core";
import { attachView } from "../utils/attachView";

// const indexSymbol = Symbol('index');
const runtimeIndexSymbol = Symbol('runtimeIndex');

export const collectionMixin = {

	collectionEnabled: undefined,
	shouldTriggerModelViewAdd: false,

	_renderCollection(changes = {}, models) {
		if (!models) { return; }

		const shouldTriggerModelViewAdd = this.get('shouldTriggerModelViewAdd');

		this._initializeCollectionEvents();

		const renderOptions = this._getRenderChildrenOptions({ 
			containerKey: 'collectionContainer', 
			childViewKey: 'modelView',
		});

		const page = this.getCollectionPageConfig();
		let childrenContainer = renderOptions.childrenContainer;

		const buffer = document.createDocumentFragment();
		let index = 0;
		let renderedAmount = 0;
		
		for (; index < models.length; index++) {

			let model = models[index];
			model[runtimeIndexSymbol] = index;

			const shouldShow = this.isModelInView(model, { index, models, page });
			let context = this._children.get(model.cid, 'model');

			if (shouldShow) {

				if (context) {
					this._children.attach(context);
				} else {
					context = this._buildContext('model', { modelCid: model.cid, removeBehavior: 'detach' });
					this._children.add(context);
				}

				if (!context.view || context.view.isDestroyed()) {
					context.view = this._buildChild({ model }, undefined, renderOptions);
					this._children.setupView(context);
				}
				const prevIndex = context.view[runtimeIndexSymbol];
				context.view[runtimeIndexSymbol] = index;
				if (prevIndex != null && prevIndex !== index) {
					context.view.triggerMethod('runtime:index:change', index);
				}
				attachView(context.view, { el: buffer, attach: 'append' });
				if (shouldTriggerModelViewAdd)  {
					this.triggerMethod('modelView:add', context.view, buffer, renderedAmount);
				}
				renderedAmount++;
			} else if (context) {
				this._children.removeContext(context, { notBulk: true });
				context.view.detach();
			}
		}
		childrenContainer.append(buffer);
		if (renderedAmount === 0) {
			this._renderEmptyView();
		}
	},

	_getCollectionOrderedModels() {
		const enabled = getDefaultValueFromConfig('view.render.collection', this.get('collectionEnabled'), !!this.collection);
		if (!(this.collection && enabled)) { return; }

		let models = this.collection.models;

		if (this.modelComparator) {
			models = [...models];
			models.sort(this.modelComparator.bind(this));
		}

		return models;

	},

	_removeModelsViews(removed, shouldReRender) {
		
		const page = this.getCollectionPageConfig();
		for(let removeModel of removed) {
			if (!shouldReRender) {
				const inViewOptions = { page, index: removed[runtimeIndexSymbol] };
				const inView = this.isModelInView(removeModel, inViewOptions);
				if (inView) { shouldReRender = true; }
			}
			this._removeModelContext(removeModel);
		}
		return shouldReRender;
	},
	removeModelView(model) {
		if (!this._children) { return; }
		this._removeModelContext(model);
		this._renderEmptyView(this.collection.length);
	},
	_removeModelContext(removedModel) {
		delete removedModel[runtimeIndexSymbol];
		let context = this._children.get(removedModel.cid, 'model');
		if (context) {
			this._children.removeContext(context, { removeBehavior: 'destroy', notBulk: true });
		}
	},


	getCollectionPageConfig() {
		if (!this._collectionPage) {
			const page = this.get('collectionPage');
			if (page) {
				this._collectionPage = page;
			} else {
				const take = this.get('collectionPageSize');
				if (take > 0) {
					this._collectionPage = { take, skip: this.get('collectionSkip') || 0 }
				}
			}
		}
		return this._collectionPage;
	},

	isModelInView(model, options = {}) {
		const inPage = this.isModelInPage(model, options);
		if (!inPage) { return false; }
		return this.isModelPassFilter(model, options);
	},
	isModelPassFilter(model, options = {}) {
		let { index, models } = options;
		if ('index' in options === false) {
			index = model[runtimeIndexSymbol];
		}
		return !this.modelFilter || this.modelFilter(model, index, models);
	},
	isModelInPage(model, options = {}) {
		let { index, page } = options;
		if ('page' in options === false) {
			page = this.getCollectionPageConfig();
		}
		if (page == null) { return true; }

		if ('index' in options === false) {
			index = model[runtimeIndexSymbol];
		}
		return index >= page.skip && index < (page.skip + page.take);
	},


	_initializeCollectionEvents() {
		if (this._renderCollectionEventsInitialized) { return; }
		this._renderCollectionEventsInitialized = true;


		this.listenTo(this.collection, {
			//change: (col, opts) => (col !== this.collection) && renderHandler(),
			update: this._onCollectionUpdate,
			//(col, opts) => (col === this.collection) && this.renderChildren(false, opts?.changes), // renderHandler(opts?.changes),
			reset: (col, opts) => this._onCollectionUpdate(col, { changes: { removed: opts?.previousModels }}),
			sort: (col) => this._onCollectionUpdate(col, { changes: { sort: true }}),
				//(col, opts) => (col === this.collection) && this.renderChildren(false, { removed: opts?.previousModels || [] }), // && renderHandler({ removed: opts?.previousModels || [] })
		});

	},
	
	_onCollectionUpdate(col, options) {
		if (this.collection !== col) { return; }
		
		const changes = options?.changes || {};
		let shouldReRender = changes.added?.length || changes?.sort;
		
		if (changes.removed?.length) {
			shouldReRender = this._removeModelsViews(changes.removed, shouldReRender);
		}
		if (shouldReRender) {
			this.renderChildren(false, options?.changes);
		} else {
			this._renderEmptyView();
		}

	},
	_onCollectionModelChange(model) {
		const page = this.getCollectionPageConfig();		
		const inView = this.isModelInView(removedModel, { page });

	},

	setModelComparator(comparator) {
		if (this.modelComparator === comparator) { return; }
		this.modelComparator = comparator;
		this.renderChildren();
	},

	setModelFilter(filter) {
		if (this.modelFilter === filter) { return; }
		this.modelFilter = filter;
		this.renderChildren();
	},

	getRenderedIndex(add) {
		let index = this[runtimeIndexSymbol];
		if (add) {
			index += add;
		}
		return index;
	},

	_renderEmptyView() {

		const rendered = this._children ? this._children.getModelViews().length : -1;
		if (rendered !== 0) { return; }

		const renderOptions = this._getRenderChildrenOptions({ 
			containerKey: 'collectionContainer', 
			childViewKey: 'modelEmptyView',
		});
		const totalModels = this.collection.models.length;
		this.triggerMethod('collection:empty', totalModels);
		if (renderOptions.childView) {
			this._renderChild(renderOptions.childView, { name: 'collectionEmptyView', totalModels }, renderOptions);
		}
	}
}