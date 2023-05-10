

export const domApi = {

	createElement(tagName) {
		return document.createElement(tagName);
	},

	setAttributes(el, attrs) {
		for(let key in attrs) {
			this.setAttribute(el, key, attrs[key]);
		}
	},

	setAttribute(el, key, value) {
		if (value == null) {
			el.removeAttribute(key);
		} else {
			el.setAttribute(key, value);
		}
	},

	render(el, templateFunc, templateContext)
	{
		if (!templateFunc) return;
		el.innerHTML = templateFunc(templateContext);
	},

	events: {
		off(el, event, ns, selector, handler) {
			throw new Error('domApi.events.off(el, event, namespace, selector, handler) not implemented');
		},
		on(el, event, ns, selector, handler) {
			throw new Error('domApi.events.on(el, event, namespace, selector, handler) not implemented');
		}
	},

	buildTemplate() {
		throw new Error('domApi.buildTemplate(arg) not implemented')
	},

	findChildElement(el, selector) {
		selector = normalizeSelector(selector);
		const child = el.querySelector(selector);
		return child;
	},

	attachElement(elementToAttach, anchorElement, attachType = 'append', attachIndex) {

		if ((attachType === 'before' || attachType === 'after') && attachIndex >= 0) {
			return this.attachElementByIndex(elementToAttach, anchorElement, attachType, attachIndex);
		}

		switch(attachType) {
			case 'append':
				anchorElement.append(elementToAttach);
				break;
			case 'replaceContent':
				anchorElement.innerHTML = '';
				anchorElement.append(elementToAttach);
				break;
			case 'replace':
				anchorElement.replaceWith(elementToAttach);
				return anchorElement;
			case 'prepend':
				anchorElement.prepend(elementToAttach);	
				break;				
			case 'before':
				anchorElement.before(elementToAttach);
				break;
			case 'after':
				anchorElement.after(elementToAttach);
				break;
			default:
				anchorElement.append(elementToAttach);
				break;
		}
	},

	attachElementByIndex(elementToAttach, anchorElement, attachType, attachIndex) {

		if (attachIndex >= anchorElement.childNodes.length) {
			attachType = 'append';
		} else {
			anchorElement = anchorElement.childNodes[attachIndex];
		}

		this.attachElement(elementToAttach, anchorElement, attachType);
	},

	detachElement(el) {
		el.remove();
	}

}


function normalizeSelector(selector) {
	if (!selector) { return selector; }
	if (selector.trim().startsWith('>')) {
		selector = ':scope ' + selector;
	}
	return selector;
}