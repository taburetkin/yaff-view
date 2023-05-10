const destroyHandler = Symbol('destroyHandler');
export class ChildrenContainer {

	constructor(parent) {
		this.parent = parent;
	}

	_ensureChildren() {
		if (this.all) return;
		this.all = new Map();
		this.byName = new Map();
		this.byRegion = new Map();
		this.byModel = new Map();
		this.intermediateModelViews = [];
		this.intermediateChildrenViews = [];
	}

	beforeParentDestroy() {
		if (!this.all) return;
		const contexts = [...this.all.values()];
		this.removeContexts(contexts, 'destroy', true);
		this.all = undefined;
		this.byName = undefined;
		this.byRegion = undefined;
		this.byModel = undefined;
		this.intermediateModelViews = undefined;
		this.intermediateChildrenViews = undefined;
	}

	beforeParentRender() {
		if (!this.all) return;
		this.removeContexts(this.intermediateChildrenViews, 'destroy');
		this.removeContexts(this.intermediateModelViews, 'detach');
		this.intermediateModelViews = [];
		this.intermediateChildrenViews = [];
	}

	removeContexts(contexts, defaultBehavior, parentDestroying) {

		for(let index = 0; index < contexts.length; index++) {
			const context = contexts[index];
			this.removeContext(context, { contexts, index, removeBehavior: defaultBehavior, parentDestroying });
		}

	}

	removeContext(context, options = {}) {
		let { destroying, parentDestroying } = options;

		const childDestroying = destroying || parentDestroying;
		const behavior = childDestroying ? 'destroy' 
			: (context.removeBehavior || options.removeBehavior || 'destroy');


		
		const view = context.view;
		
		if (behavior === 'destroy') {
			if (!parentDestroying) {
				this.all.delete(context.id);
				if (context.modelCid) {
					this.byModel.delete(context.modelCid);
				}
				if (context.name) {
					this.byName.delete(context.name);
				}
				if (context.region) {
					this.byRegion.delete(context.region);
				}
			}
			if (view && !destroying) { context.view.destroy(); }
		} else {
			context.detached = true;
			if (view) { context.view.detach(); }
		}
		
		if (options.notBulk) {
			const intermediate = context.modelCid ? this.intermediateModelViews : this.intermediateChildrenViews;
			const index = intermediate.indexOf(context);
			if (index > -1) intermediate.splice(index, 1);			
		}

	}

	get(identifier, setName) {
		if (!this.all) return;
		const contexts = this._getSet(setName);
		return contexts?.get(identifier);
	}

	_getSet(name) {
		switch(name) {
			case 'name':
				return this.byName;
			case 'region':
				return this.byRegion;
			case 'model':
				return this.byModel;
			default:
				return this.contexts;
		}
	}

	getView(identifier, setName) {
		const context = this.get(identifier, setName);
		if (context) return context.view;
	}

	add(context) {
		this._ensureChildren();
		this.all.set(context.id, context);

		if (context.name) {
			this.byName.set(context.name, context);
		}
		if (context.region) {
			this.byRegion.set(context.region, context);
		}

		this._pushIntermediate(context);

		this.setupView(context);

	}

	_pushIntermediate(context) {
		const intermediate = context.modelCid ? this.intermediateModelViews : this.intermediateChildrenViews;
		if (context.modelCid) {
			this.byModel.set(context.modelCid, context);
		}
		intermediate.push(context);
	}

	attach(context) {
		delete context.detached;
		this._pushIntermediate(context);
	}

	getModelViews() {
		this._ensureChildren();
		return this.intermediateModelViews;
	}

	setupView(context) {
		if (context.view && !context.view[destroyHandler]) {
			context.view[destroyHandler] = 'settled';
			context.view.on('before:destroy', () => this.removeContext(context, { destroying: true, noBulk: true }));
		}
	}


}
