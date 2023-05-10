export function attachView(view, options = {}) {

	if (options instanceof Element) {
		options = { el: options };
	}

	if (options.el == null) {
		throw new Error('unable to attach view: anchor element missing - pass { el: Element } or Element as second argument');
	}

	if (view == null || view.isDestroyed()) {
		throw new Error('argument must be a not destroyed view');
	}

	const { render = true, attach, el, triggerAttach, attachIndex } = options;

	if (render && !view.isRendered()) {
		view.render()
	}

	if (triggerAttach) {
		view.triggerMethod('before:attach', view);
	}

	const replacedEl = view.dom.attachElement(view.el, el, attach, attachIndex)
	
	if (triggerAttach) {
		view._isAttached = true;
		view.triggerMethod('attach', view);
	}

	if (attach === 'replace') {
		return replacedEl;
	}

}